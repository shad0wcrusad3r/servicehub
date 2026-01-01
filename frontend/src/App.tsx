import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Loading from './components/ui/Loading';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import LabourSignupPage from './pages/auth/LabourSignupPage';
import ClientSignupPage from './pages/auth/ClientSignupPage';
import LabourDashboard from './pages/labour/LabourDashboard';
import AvailableJobsPage from './pages/labour/AvailableJobsPage';
import ClientDashboard from './pages/client/ClientDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import BrowseLabour from './pages/client/BrowseLabour';
import PostJobPage from './pages/client/PostJobPage';
import JobApplicationsPage from './pages/client/JobApplicationsPage';
import JobsPage from './pages/JobsPage';

// Protected route wrapper
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  roles?: string[];
}> = ({ children, roles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Public route wrapper (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'labour':
        return <Navigate to="/labour/dashboard" replace />;
      case 'client':
        return <Navigate to="/client/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          
          <Route
            path="/signup/labour"
            element={
              <PublicRoute>
                <LabourSignupPage />
              </PublicRoute>
            }
          />
          
          <Route
            path="/signup/client"
            element={
              <PublicRoute>
                <ClientSignupPage />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/labour/dashboard"
            element={
              <ProtectedRoute roles={['labour']}>
                <LabourDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/labour/available-jobs"
            element={
              <ProtectedRoute roles={['labour']}>
                <AvailableJobsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/dashboard"
            element={
              <ProtectedRoute roles={['client']}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/browse"
            element={
              <ProtectedRoute roles={['client']}>
                <BrowseLabour />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/post-job"
            element={
              <ProtectedRoute roles={['client']}>
                <PostJobPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/jobs/:jobId/applications"
            element={
              <ProtectedRoute roles={['client']}>
                <JobApplicationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <JobsPage />
              </ProtectedRoute>
            }
          />

          {/* Error routes */}
          <Route
            path="/unauthorized"
            element={
              <div className="text-center py-16">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Unauthorized Access
                </h1>
                <p className="text-gray-600">
                  You don't have permission to access this page.
                </p>
              </div>
            }
          />

          <Route
            path="*"
            element={
              <div className="text-center py-16">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Page Not Found
                </h1>
                <p className="text-gray-600">
                  The page you're looking for doesn't exist.
                </p>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;