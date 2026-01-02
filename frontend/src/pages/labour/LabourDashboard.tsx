import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AlertCircle, CheckCircle, Clock, Star, Search, FileText, Briefcase, DollarSign, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Job } from '../../types';
import { formatDate, formatCurrency, getStatusColor, getStatusText } from '../../utils/helpers';
import StarRating from '../../components/ui/StarRating';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Notification from '../../components/ui/Notification';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const LabourDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  // Fetch jobs
  const { data: myJobsData, isLoading: myJobsLoading } = useQuery('labour-my-jobs', async () => {
    const response = await api.get('/jobs/my-jobs?limit=5');
    return response.data;
  });

  const { data: availableJobsData, isLoading: availableJobsLoading } = useQuery('labour-available-jobs', async () => {
    const response = await api.get('/jobs/available?limit=3');
    return response.data;
  });

  // Fetch my applications
  const { data: applicationsData } = useQuery('my-applications', async () => {
    const response = await api.get('/jobs/my-applications?limit=5');
    return response.data;
  });

  // Mark payment received mutation
  const markPaymentReceived = useMutation(
    async (jobId: string) => {
      const response = await api.patch(`/jobs/${jobId}/payment-received`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Payment confirmed! Client can now rate you.');
        queryClient.invalidateQueries('labour-my-jobs');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to confirm payment');
      },
    }
  );

  const myJobs = myJobsData?.jobs || [];
  const availableJobs = availableJobsData?.jobs || [];
  const applications = applicationsData?.applications || [];
  const pendingApplications = applications.filter((app: any) => app.status === 'pending');

  // Load dismissed notifications from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissedNotifications');
    if (dismissed) {
      setDismissedNotifications(JSON.parse(dismissed));
    }
  }, []);

  // Find recently accepted or rejected applications (within last 24 hours)
  const recentlyProcessedApplications = applications.filter((app: any) => {
    if (app.status === 'pending') return false;
    if (!app.respondedAt) return false;
    
    const respondedDate = new Date(app.respondedAt);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return respondedDate > oneDayAgo && !dismissedNotifications.includes(app._id);
  });

  const handleDismissNotification = (notificationId: string) => {
    const newDismissed = [...dismissedNotifications, notificationId];
    setDismissedNotifications(newDismissed);
    localStorage.setItem('dismissedNotifications', JSON.stringify(newDismissed));
  };

  if (myJobsLoading || availableJobsLoading) {
    return <Loading text="Loading dashboard..." />;
  }

  const labour = user?.labour;
  const isApproved = labour?.isApproved;

  const stats = [
    {
      title: 'Jobs Completed',
      value: myJobs.filter((job: Job) => job.status === 'completed').length,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Active Jobs',
      value: myJobs.filter((job: Job) => ['in_progress', 'awaiting_completion'].includes(job.status)).length,
      icon: Clock,
      color: 'text-blue-600',
    },
    {
      title: 'Average Rating',
      value: labour?.averageRating ? labour.averageRating.toFixed(1) : '0.0',
      icon: Star,
      color: 'text-yellow-600',
    },
    {
      title: 'Pending Applications',
      value: pendingApplications.length,
      icon: FileText,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Welcome, <span className="gradient-text">{labour?.name}!</span>
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Manage your jobs and find new opportunities.
        </p>
      </div>

      {/* Application Status Notifications */}
      {recentlyProcessedApplications.map((app: any) => (
        <Notification
          key={app._id}
          type={app.status === 'accepted' ? 'success' : 'error'}
          title={
            app.status === 'accepted'
              ? '🎉 Application Accepted!'
              : 'Application Not Selected'
          }
          message={
            app.status === 'accepted'
              ? `Your application for "${app.job?.title || 'the job'}" has been accepted by the client. They will contact you to begin work.`
              : `Your application for "${app.job?.title || 'the job'}" was not selected this time. Keep applying to more jobs!`
          }
          onDismiss={() => handleDismissNotification(app._id)}
        />
      ))}

      {/* Approval Status */}
      {!isApproved && (
        <div className="bg-gradient-to-r from-accent-50 to-accent-100 border-l-4 border-l-accent-500 rounded-2xl shadow-soft">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-accent-200 rounded-xl mr-4">
                <AlertCircle className="w-6 h-6 text-accent-700" />
              </div>
              <div>
                <h3 className="font-bold text-accent-900 text-lg">Pending Approval</h3>
                <p className="text-accent-800 mt-1">
                  Your profile is under review. You'll be able to apply for jobs once approved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Summary */}
      <div className="card group">
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                Your Profile
                {isApproved && (
                  <span className="badge badge-success animate-fade-in">✓ Verified</span>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Briefcase className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Categories</p>
                    <p className="text-sm text-gray-900 font-semibold">{labour?.categories?.map(cat => cat.name).join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success-100 rounded-lg">
                    <DollarSign className="w-4 h-4 text-success-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Hourly Rate</p>
                    <p className="text-sm text-gray-900 font-semibold">{formatCurrency(labour?.hourlyRate || 0)}/hr</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary-100 rounded-lg">
                    <MapPin className="w-4 h-4 text-secondary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Location</p>
                    <p className="text-sm text-gray-900 font-semibold">{labour?.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent-100 rounded-lg">
                    <Star className="w-4 h-4 text-accent-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Rating</p>
                    <div className="flex items-center gap-2">
                      <StarRating 
                        rating={labour?.averageRating || 0} 
                        readonly 
                        size="sm"
                        showCount
                        count={labour?.ratingCount || 0}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Available Jobs */}
      {isApproved && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Available Jobs</h2>
              <Link to="/jobs" className="text-primary-600 hover:text-primary-700 font-medium">
                View All
              </Link>
            </div>
          </div>
          <div className="card-body">
            {availableJobs.length > 0 ? (
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
                          {job.category.name} • {job.city}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Client: {job.client.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Posted {formatDate(job.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
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
                          onClick={() => navigate('/labour/available-jobs')}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs available</h3>
                <p className="text-gray-600">
                  Check back later for new job opportunities in your area.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* My Jobs */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Jobs</h2>
            <Link to="/jobs" className="text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>
        </div>
        <div className="card-body">
          {myJobs.length > 0 ? (
            <div className="space-y-4">
              {myJobs.map((job: Job) => (
                <div
                  key={job._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {job.category.name} • {job.city}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Client: {job.client.name}
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

                  {/* Job Actions */}
                  {job.status === 'awaiting_completion' && (
                    <div className="mt-3">
                      <button
                        onClick={() => markPaymentReceived.mutate(job._id)}
                        className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Confirm Payment Received
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active jobs</h3>
              <p className="text-gray-600">
                Start applying for jobs to see them here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabourDashboard;