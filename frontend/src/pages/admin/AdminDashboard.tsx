import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Users, CheckCircle, XCircle, AlertCircle, Briefcase } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch unapproved labours
  const { data: unapprovedData, isLoading } = useQuery('unapproved-labours', async () => {
    const response = await api.get('/labour/admin/unapproved');
    return response.data;
  });

  // Approve labour mutation
  const approveMutation = useMutation(
    async (labourId: string) => {
      const response = await api.patch(`/labour/${labourId}/approval`, { isApproved: true });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('unapproved-labours');
        toast.success('Labour approved successfully!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to approve labour');
      },
    }
  );

  // Reject labour mutation
  const rejectMutation = useMutation(
    async (labourId: string) => {
      const response = await api.patch(`/labour/${labourId}/approval`, { isApproved: false });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('unapproved-labours');
        toast.success('Labour rejected successfully!');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.error || 'Failed to reject labour');
      },
    }
  );

  const handleReject = (labourId: string, labourName: string) => {
    if (window.confirm(`Are you sure you want to reject ${labourName}? This action cannot be undone.`)) {
      rejectMutation.mutate(labourId);
    }
  };

  if (isLoading) {
    return <Loading text="Loading admin dashboard..." />;
  }

  const unapprovedLabours = unapprovedData?.labours || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage worker approvals and monitor platform activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{unapprovedLabours.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Workers</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Worker Approval Queue</h2>
        </div>
        <div className="card-body">
          {unapprovedLabours.length > 0 ? (
            <div className="space-y-4">
              {unapprovedLabours.map((labour: any) => (
                <div
                  key={labour.id}
                  className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {labour.name}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Phone:</span> {labour.phone}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">City:</span> {labour.city}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Hourly Rate:</span> {formatCurrency(labour.hourlyRate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Categories:</span>{' '}
                            {labour.categories.map((cat: any) => cat.name).join(', ')}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Applied:</span> {formatDate(labour.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 ml-6">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => approveMutation.mutate(labour.id)}
                        loading={approveMutation.isLoading}
                        disabled={rejectMutation.isLoading}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReject(labour.id, labour.name)}
                        loading={rejectMutation.isLoading}
                        disabled={approveMutation.isLoading}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">
                No workers pending approval at the moment.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Users className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Categories</h3>
              <p className="text-sm text-gray-600">Add or edit job categories</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Briefcase className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">View All Jobs</h3>
              <p className="text-sm text-gray-600">Monitor platform activity</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <AlertCircle className="w-8 h-8 text-yellow-600 mb-2" />
              <h3 className="font-medium text-gray-900">Reports</h3>
              <p className="text-sm text-gray-600">Platform analytics</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <CheckCircle className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">Settings</h3>
              <p className="text-sm text-gray-600">Platform configuration</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;