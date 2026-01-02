import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { PlusCircle, Users, Briefcase, Eye, CheckCircle, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Job } from '../../types';
import { formatDate, formatCurrency, getStatusColor, getStatusText } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch recent jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery('client-jobs', async () => {
    const response = await api.get('/jobs/my-jobs?limit=5');
    return response.data;
  });

  // Mark work as done mutation
  const markWorkDone = useMutation(
    async (jobId: string) => {
      const response = await api.patch(`/jobs/${jobId}/work-done`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Work marked as done! Worker has been notified.');
        queryClient.invalidateQueries('client-jobs');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to mark work as done');
      },
    }
  );

  const jobs = jobsData?.jobs || [];

  if (jobsLoading) {
    return <Loading text="Loading dashboard..." />;
  }

  const stats = [
    {
      title: 'Total Jobs Posted',
      value: jobs.length,
      icon: Briefcase,
      color: 'text-blue-600',
    },
    {
      title: 'Active Jobs',
      value: jobs.filter((job: Job) => ['open', 'in_progress', 'awaiting_completion'].includes(job.status)).length,
      icon: Eye,
      color: 'text-green-600',
    },
    {
      title: 'Completed Jobs',
      value: jobs.filter((job: Job) => job.status === 'completed').length,
      icon: Users,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.client?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your jobs and find skilled workers.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link to="/client/browse" className="btn btn-outline">
            <Users className="w-4 h-4 mr-2" />
            Browse Workers
          </Link>
          <Link to="/client/post-job">
            <Button variant="primary">
              <PlusCircle className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card group hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 group-hover:scale-110 transition-transform ${stat.color}`}>
                <stat.icon className="w-7 h-7" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Jobs</h2>
            <Link to="/jobs" className="text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>
        </div>
        <div className="card-body">
          {jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job: Job) => (
                <div
                  key={job._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {job.category.name} • {job.city}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Posted {formatDate(job.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(job.hourlyRate)}/hr
                      </span>
                      <span className={`badge ${getStatusColor(job.status)}`}>
                        {getStatusText(job.status)}
                      </span>
                    </div>
                  </div>
                  
                  {job.labour && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600">
                        Worker: <span className="font-medium">{job.labour.name}</span>
                      </p>
                    </div>
                  )}

                  {/* Job Actions */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.status === 'open' && (
                      <button
                        onClick={() => navigate(`/client/jobs/${job._id}/applications`)}
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        View Applications
                      </button>
                    )}
                    {job.status === 'in_progress' && (
                      <button
                        onClick={() => markWorkDone.mutate(job._id)}
                        className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Mark Work Done
                      </button>
                    )}
                    {job.status === 'completed' && (
                      <button
                        onClick={() => navigate(`/job/${job._id}`)}
                        className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        View Details / Rate Worker
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-gray-600 mb-4">
                Start by posting your first job to find skilled workers.
              </p>
              <Link to="/client/post-job">
                <Button variant="primary">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Post Your First Job
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/client/post-job"
                className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <PlusCircle className="w-5 h-5 text-primary-600 mr-3" />
                  <span className="font-medium">Post a New Job</span>
                </div>
              </Link>
              <Link
                to="/client/browse"
                className="block w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-primary-600 mr-3" />
                  <span className="font-medium">Browse Workers</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="font-semibold text-gray-900 mb-3">Tips</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Provide detailed job descriptions to attract the right workers
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ⭐ Rate workers after job completion to help the community
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;