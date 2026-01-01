import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Search, Briefcase, MapPin, Clock } from 'lucide-react';
import { Job, JobApplicationSubmit } from '../../types';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AvailableJobsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  // Fetch available jobs
  const { data: jobsData, isLoading } = useQuery('available-jobs', async () => {
    const response = await api.get('/jobs/available');
    return response.data;
  });

  // Fetch my applications to check if already applied
  const { data: myApplicationsData } = useQuery('my-applications', async () => {
    const response = await api.get('/jobs/my-applications');
    return response.data;
  });

  // Submit application mutation
  const submitApplication = useMutation(
    async ({ jobId, data }: { jobId: string; data: JobApplicationSubmit }) => {
      const response = await api.post(`/jobs/${jobId}/apply`, data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Application submitted successfully!');
        queryClient.invalidateQueries('available-jobs');
        queryClient.invalidateQueries('my-applications');
        setShowApplicationModal(false);
        setSelectedJob(null);
        setApplicationMessage('');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to submit application');
      },
    }
  );

  const jobs = jobsData?.jobs || [];
  const myApplications = myApplicationsData?.applications || [];

  // Check if already applied to a job
  const hasApplied = (jobId: string) => {
    return myApplications.some((app: any) => 
      (typeof app.job === 'string' ? app.job : app.job._id) === jobId
    );
  };

  const handleApply = (job: Job) => {
    // Check if already applied before opening modal
    if (hasApplied(job._id)) {
      toast.error('You have already applied for this job');
      return;
    }
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleSubmitApplication = () => {
    if (!selectedJob) return;
    submitApplication.mutate({
      jobId: selectedJob._id,
      data: { message: applicationMessage.trim() || undefined },
    });
  };

  if (isLoading) {
    return <Loading text="Loading available jobs..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Available Jobs</h1>
        <p className="text-gray-600 mt-2">
          Browse and apply for jobs matching your skills and location.
        </p>
      </div>

      {/* Jobs List */}
      {jobs.length > 0 ? (
        <div className="grid gap-6">
          {jobs.map((job: Job) => (
            <div key={job._id} className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-primary-50 rounded-lg">
                        <Briefcase className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {job.city}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {job.estimatedHours} hours
                          </span>
                          <span className={`badge ${getStatusColor(job.status)}`}>
                            {job.category.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-700 mt-4">{job.description}</p>

                    {/* Client Info */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Client:</span> {job.client.name}
                        {job.client.company && ` (${job.client.company})`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Posted {formatDate(job.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Rate & Action */}
                  <div className="flex flex-col items-end gap-3 md:w-48">
                    <div className="text-right">
                      <div className="flex items-center justify-end text-2xl font-bold text-gray-900">
                        ₹{formatCurrency(job.hourlyRate)}/hr
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Est. ₹{formatCurrency(job.hourlyRate * job.estimatedHours)}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => handleApply(job)}
                      disabled={hasApplied(job._id)}
                    >
                      {hasApplied(job._id) ? 'Already Applied' : 'Apply Now'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs available</h3>
            <p className="text-gray-600">
              Check back later for new job opportunities in your area and categories.
            </p>
          </div>
        </div>
      )}

      {/* Application Modal */}
      {showApplicationModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Apply for Job</h2>
              
              {/* Job Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900">{selectedJob.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedJob.category.name} • {selectedJob.city} • ₹{formatCurrency(selectedJob.hourlyRate)}/hr
                </p>
              </div>

              {/* Application Message */}
              <div className="mb-6">
                <label className="form-label">
                  Message to Client (Optional)
                </label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Introduce yourself, mention relevant experience, or ask questions..."
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {applicationMessage.length}/500 characters
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowApplicationModal(false);
                    setSelectedJob(null);
                    setApplicationMessage('');
                  }}
                  disabled={submitApplication.isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={handleSubmitApplication}
                  loading={submitApplication.isLoading}
                >
                  Submit Application
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableJobsPage;
