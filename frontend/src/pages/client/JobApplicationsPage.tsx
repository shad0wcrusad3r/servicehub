import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { ArrowLeft, Phone, Star, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { JobApplication } from '../../types';
import { formatDate, formatCurrency, renderStars, formatPhoneDisplay } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const JobApplicationsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch job applications
  const { data: applicationsData, isLoading } = useQuery(
    ['job-applications', jobId],
    async () => {
      const response = await api.get(`/jobs/${jobId}/applications`);
      return response.data;
    },
    {
      enabled: !!jobId,
    }
  );

  // Accept application mutation
  const acceptApplication = useMutation(
    async (applicationId: string) => {
      const response = await api.patch(`/jobs/applications/${applicationId}/accept`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Application accepted! Worker has been notified.');
        queryClient.invalidateQueries(['job-applications', jobId]);
        queryClient.invalidateQueries('client-jobs');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to accept application');
      },
    }
  );

  // Reject application mutation
  const rejectApplication = useMutation(
    async (applicationId: string) => {
      const response = await api.patch(`/jobs/applications/${applicationId}/reject`);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Application rejected');
        queryClient.invalidateQueries(['job-applications', jobId]);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to reject application');
      },
    }
  );

  if (isLoading) {
    return <Loading text="Loading applications..." />;
  }

  const applications = applicationsData?.applications || [];
  const pendingApplications = applications.filter((app: JobApplication) => app.status === 'pending');
  const processedApplications = applications.filter((app: JobApplication) => app.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
        <p className="text-gray-600 mt-2">
          Review applications and select the best worker for your job.
        </p>
      </div>

      {/* Pending Applications */}
      {pendingApplications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Pending Applications ({pendingApplications.length})
          </h2>
          {pendingApplications.map((application: JobApplication) => (
            <div key={application._id} className="card">
              <div className="card-body">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Worker Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {application.labour.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(application.labour.averageRating)}
                          <span className="text-sm text-gray-600">
                            ({application.labour.ratingCount} reviews)
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {formatCurrency(application.labour.hourlyRate)}/hr
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {application.labour.city}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {application.labour.user?.phone && formatPhoneDisplay(application.labour.user.phone)}
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {application.labour.categories.map((category) => (
                        <span key={category._id} className="badge badge-info">
                          {category.name}
                        </span>
                      ))}
                    </div>

                    {/* Message */}
                    {application.message && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700 italic">"{application.message}"</p>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-3">
                      Applied {formatDate(application.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-3 md:w-40">
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => acceptApplication.mutate(application._id)}
                      loading={acceptApplication.isLoading}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => rejectApplication.mutate(application._id)}
                      loading={rejectApplication.isLoading}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Processed Applications */}
      {processedApplications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Processed Applications ({processedApplications.length})
          </h2>
          {processedApplications.map((application: JobApplication) => (
            <div key={application._id} className="card opacity-75">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.labour.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {application.labour.categories.map(c => c.name).join(', ')}
                    </p>
                  </div>
                  <span
                    className={`badge ${
                      application.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {application.status === 'accepted' ? 'Accepted' : 'Rejected'}
                  </span>
                </div>
                {application.respondedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    Processed {formatDate(application.respondedAt)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Applications */}
      {applications.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-12">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600">
              Workers will see your job and can apply. Check back soon!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicationsPage;
