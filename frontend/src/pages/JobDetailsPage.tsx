import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Job } from '../types';
import { formatDate, formatCurrency, getStatusColor, getStatusText } from '../utils/helpers';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import RatingForm from '../components/ui/RatingForm';
import RatingsList from '../components/ui/RatingsList';
import StarRating from '../components/ui/StarRating';
import api from '../utils/api';

const JobDetailsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [showRatingForm, setShowRatingForm] = useState(false);

  const { data, isLoading, error } = useQuery(
    ['job', jobId],
    async () => {
      const response = await api.get(`/jobs/my-jobs`);
      const job = response.data.jobs.find((j: Job) => j._id === jobId);
      return job;
    },
    {
      enabled: !!jobId,
    }
  );

  const { data: ratingData } = useQuery(
    ['job-rating', jobId],
    async () => {
      const response = await api.get(`/ratings/job/${jobId}/rating`);
      return response.data;
    },
    {
      enabled: !!jobId,
      retry: false,
    }
  );

  if (isLoading) {
    return <Loading text="Loading job details..." />;
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
        <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or you don't have access to it.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const job: Job = data;
  const hasRating = !!ratingData?.rating;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`badge ${getStatusColor(job.status)}`}>
                {getStatusText(job.status)}
              </span>
              <span className="text-sm text-gray-600">{job.category.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Job Details Card */}
      <div className="card">
        <div className="card-body space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{job.description}</p>
          </div>

          {/* Job Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <div className="flex items-center text-gray-600 mb-1">
                <DollarSign className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">Hourly Rate</span>
              </div>
              <p className="font-semibold text-gray-900">{formatCurrency(job.hourlyRate)}</p>
            </div>
            <div>
              <div className="flex items-center text-gray-600 mb-1">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">Duration</span>
              </div>
              <p className="font-semibold text-gray-900">{job.estimatedHours} hours</p>
            </div>
            <div>
              <div className="flex items-center text-gray-600 mb-1">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">Location</span>
              </div>
              <p className="font-semibold text-gray-900">{job.city}</p>
            </div>
            <div>
              <div className="flex items-center text-gray-600 mb-1">
                <Calendar className="w-4 h-4 mr-1" />
                <span className="text-xs font-medium">Posted</span>
              </div>
              <p className="font-semibold text-gray-900 text-sm">
                {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Client Info */}
          <div className="pt-4 border-t">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Client</p>
                <p className="font-semibold text-gray-900">{job.client.name}</p>
                {job.client.company && (
                  <p className="text-sm text-gray-600">{job.client.company}</p>
                )}
              </div>
            </div>
          </div>

          {/* Worker Info */}
          {job.labour && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Worker</p>
                  <p className="font-semibold text-gray-900">{job.labour.name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          {job.acceptedAt && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-gray-600">Posted:</span>
                  <span className="font-medium text-gray-900 ml-2">{formatDate(job.createdAt)}</span>
                </div>
                {job.acceptedAt && (
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-gray-600">Accepted:</span>
                    <span className="font-medium text-gray-900 ml-2">{formatDate(job.acceptedAt)}</span>
                  </div>
                )}
                {job.workCompletedAt && (
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-gray-600">Work Completed:</span>
                    <span className="font-medium text-gray-900 ml-2">{formatDate(job.workCompletedAt)}</span>
                  </div>
                )}
                {job.completedAt && (
                  <div className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium text-gray-900 ml-2">{formatDate(job.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating Section */}
      {job.status === 'completed' && job.labour && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-semibold">Worker Rating</h3>
          </div>
          <div className="card-body">
            {hasRating ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm text-green-800 font-medium mb-1">Your Rating</p>
                    <StarRating rating={ratingData.rating.rating} readonly size="lg" />
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                {ratingData.rating.comment && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Your Review</p>
                    <p className="text-gray-900">{ratingData.rating.comment}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 text-center">
                  Submitted on {formatDate(ratingData.rating.createdAt)}
                </p>
              </div>
            ) : showRatingForm ? (
              <RatingForm
                jobId={job._id}
                labourName={job.labour.name}
                onSuccess={() => setShowRatingForm(false)}
                onCancel={() => setShowRatingForm(false)}
              />
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">
                  How was your experience working with {job.labour.name}?
                </p>
                <Button onClick={() => setShowRatingForm(true)} variant="primary">
                  Rate This Worker
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Worker's Other Ratings */}
      {job.labour && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-semibold">Other Reviews for {job.labour.name}</h3>
          </div>
          <div className="card-body">
            <RatingsList labourId={job.labour._id} limit={5} showJobTitle={true} />
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailsPage;
