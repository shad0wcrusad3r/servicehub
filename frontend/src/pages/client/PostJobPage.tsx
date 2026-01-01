import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import Button from '../../components/ui/Button';
import { JobCreateData, Category } from '../../types';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const PostJobPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery('categories', async () => {
    const response = await api.get('/categories');
    return response.data.categories as Category[];
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<JobCreateData>();

  const watchedValues = watch();
  const estimatedCost = watchedValues.estimatedHours ? watchedValues.estimatedHours * 200 : 0; // Rough estimate

  const onSubmit = async (data: JobCreateData) => {
    try {
      setIsSubmitting(true);
      
      await api.post('/jobs', data);
      
      toast.success('Job posted successfully!');
      navigate('/client/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to post job';
      toast.error(message);
      setError('root', { message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (categoriesLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
          <p className="text-gray-600 mt-2">Describe your job requirements and connect with skilled workers</p>
        </div>

        {/* Job Form */}
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Job Title */}
              <div>
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Kitchen Plumbing Repair"
                  {...register('title', {
                    required: 'Job title is required',
                    minLength: { value: 5, message: 'Title must be at least 5 characters' },
                    maxLength: { value: 100, message: 'Title must be less than 100 characters' }
                  })}
                />
                {errors.title && (
                  <p className="form-error">{errors.title.message}</p>
                )}
              </div>

              {/* Job Category */}
              <div>
                <label className="form-label">Job Category *</label>
                <select
                  className="form-input"
                  {...register('category', {
                    required: 'Please select a job category'
                  })}
                >
                  <option value="">Select a category...</option>
                  {categoriesData?.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="form-error">{errors.category.message}</p>
                )}
              </div>

              {/* Job Description */}
              <div>
                <label className="form-label">Job Description *</label>
                <textarea
                  className="form-input"
                  rows={5}
                  placeholder="Describe the work that needs to be done, including specific requirements, tools needed, materials to be provided, timeline expectations, etc."
                  {...register('description', {
                    required: 'Job description is required',
                    minLength: { value: 20, message: 'Description must be at least 20 characters' },
                    maxLength: { value: 1000, message: 'Description must be less than 1000 characters' }
                  })}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {watchedValues.description?.length || 0}/1000 characters
                </div>
                {errors.description && (
                  <p className="form-error">{errors.description.message}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="form-label">Location *</label>
                <select
                  className="form-input"
                  {...register('city', {
                    required: 'Please select a location'
                  })}
                >
                  <option value="">Select location...</option>
                  <option value="Hubli">Hubli</option>
                  <option value="Dharwad">Dharwad</option>
                </select>
                {errors.city && (
                  <p className="form-error">{errors.city.message}</p>
                )}
              </div>

              {/* Estimated Hours */}
              <div>
                <label className="form-label">Estimated Hours *</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="100"
                  className="form-input"
                  placeholder="e.g., 4"
                  {...register('estimatedHours', {
                    required: 'Estimated hours is required',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Minimum 1 hour required' },
                    max: { value: 100, message: 'Maximum 100 hours allowed' }
                  })}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Be realistic about the time required for quality work
                </div>
                {errors.estimatedHours && (
                  <p className="form-error">{errors.estimatedHours.message}</p>
                )}
              </div>

              {/* Cost Estimate */}
              {estimatedCost > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Estimated Cost</h4>
                  <p className="text-blue-700">
                    Approximately ₹{estimatedCost.toLocaleString('en-IN')} 
                    <span className="text-sm text-blue-600 ml-2">
                      ({watchedValues.estimatedHours} hours × ~₹200/hour)
                    </span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    *Actual rate may vary based on worker's experience and job complexity
                  </p>
                </div>
              )}

              {/* Form Errors */}
              {errors.root && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm">{errors.root.message}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Posting Job...' : 'Post Job'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Tips for posting effective jobs</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Be specific about what needs to be done</li>
            <li>• Mention if special tools or materials are required</li>
            <li>• Include preferred timeline or urgency level</li>
            <li>• Provide clear access instructions if needed</li>
            <li>• Specify if you'll provide materials or if worker should bring them</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PostJobPage;