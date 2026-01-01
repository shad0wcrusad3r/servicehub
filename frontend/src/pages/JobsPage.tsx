import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Job } from '../types';
import { formatDate, formatCurrency, getStatusColor, getStatusText } from '../utils/helpers';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import api from '../utils/api';
import toast from 'react-hot-toast';

const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch jobs based on user role
  const { data: jobsData, isLoading } = useQuery('my-jobs', async () => {
    if (user?.role === 'labour') {
      // For labour, get both their jobs and available jobs
      const [myJobsRes, availableJobsRes] = await Promise.all([
        api.get('/jobs/my-jobs'),
        api.get('/jobs/available'),
      ]);
      return {
        myJobs: myJobsRes.data.jobs,
        availableJobs: availableJobsRes.data.jobs,
      };
    } else {
      // For clients and admins, just get their jobs
      const response = await api.get('/jobs/my-jobs');
      return { myJobs: response.data.jobs, availableJobs: [] };
    }
  });

  // Accept job mutation (labour only)
  const acceptJobMutation = useMutation(
    async (jobId: string) => {
      const response = await api.patch(`/jobs/${jobId}/accept`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-jobs');
        toast.success('Job accepted successfully!');
      },
    }
  );

  // Mark work done mutation (client only)
  const markWorkDoneMutation = useMutation(
    async (jobId: string) => {
      const response = await api.patch(`/jobs/${jobId}/work-done`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-jobs');
        toast.success('Work marked as done!');
      },
    }
  );

  // Mark payment received mutation (labour only)
  const markPaymentReceivedMutation = useMutation(
    async (jobId: string) => {
      const response = await api.patch(`/jobs/${jobId}/payment-received`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-jobs');
        toast.success('Payment marked as received!');
      },
    }
  );

  if (isLoading) {
    return <Loading text="Loading jobs..." />;
  }

  const myJobs = jobsData?.myJobs || [];
  const availableJobs = jobsData?.availableJobs || [];

  const filteredMyJobs = statusFilter === 'all' 
    ? myJobs 
    : myJobs.filter((job: Job) => job.status === statusFilter);

  const getActionButton = (job: Job) => {
    if (user?.role === 'client') {
      if (job.status === 'in_progress') {
        return (
          <Button
            size="sm"
            variant="success"
            onClick={() => markWorkDoneMutation.mutate(job._id)}
            loading={markWorkDoneMutation.isLoading}
          >
            Mark Work Done
          </Button>
        );
      }
    } else if (user?.role === 'labour') {
      if (job.status === 'awaiting_completion') {
        return (
          <Button
            size="sm"
            variant="success"
            onClick={() => markPaymentReceivedMutation.mutate(job._id)}
            loading={markPaymentReceivedMutation.isLoading}
          >
            Payment Received
          </Button>
        );
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
        <p className="text-gray-600 mt-2">
          {user?.role === 'labour' 
            ? 'Manage your jobs and find new opportunities'
            : 'Track your posted jobs and their progress'
          }
        </p>
      </div>

      {/* Available Jobs (Labour only) */}
      {user?.role === 'labour' && availableJobs.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold">Available Jobs</h2>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {availableJobs.map((job: Job) => (
                <div
                  key={job._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {job.category.name} • {job.city} • {job.client.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Posted {formatDate(job.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(job.hourlyRate)}/hr
                        </p>
                        <p className="text-xs text-gray-500">
                          ~{job.estimatedHours} hours
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => acceptJobMutation.mutate(job._id)}
                        loading={acceptJobMutation.isLoading}
                      >
                        Accept Job
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <select
              className="form-select w-auto"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Jobs</option>
              <option value="open">Open</option>
              <option value="accepted">Accepted</option>
              <option value="work_done">Work Done</option>
              <option value="payment_received">Payment Received</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* My Jobs */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">
            {user?.role === 'labour' ? 'My Jobs' : 'Posted Jobs'}
          </h2>
        </div>
        <div className="card-body">
          {filteredMyJobs.length > 0 ? (
            <div className="space-y-4">
              {filteredMyJobs.map((job: Job) => (
                <div
                  key={job._id}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {job.title}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Category:</span> {job.category.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Location:</span> {job.city}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Rate:</span> {formatCurrency(job.hourlyRate)}/hr
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Estimated Hours:</span> {job.estimatedHours}
                          </p>
                        </div>
                        <div>
                          {user?.role === 'labour' && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Client:</span> {job.client.name}
                            </p>
                          )}
                          {user?.role === 'client' && job.labour && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Worker:</span> {job.labour.name}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Posted:</span> {formatDate(job.createdAt)}
                          </p>
                          {job.acceptedAt && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Accepted:</span> {formatDate(job.acceptedAt)}
                            </p>
                          )}
                          {job.completedAt && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Completed:</span> {formatDate(job.completedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                        <p className="text-sm text-gray-600">{job.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-3 ml-6">
                      <span className={`badge ${getStatusColor(job.status)}`}>
                        {getStatusText(job.status)}
                      </span>
                      {getActionButton(job)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">
                {statusFilter === 'all' 
                  ? 'You have no jobs yet.'
                  : `No jobs with status "${getStatusText(statusFilter)}".`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsPage;