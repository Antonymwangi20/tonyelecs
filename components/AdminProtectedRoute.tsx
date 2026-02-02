import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import type { AdminRole } from '../contexts/AdminAuthContext';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AdminRole[];
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children, requiredRole = ['manager', 'super-admin'] }) => {
  const { admin, isLoading } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!requiredRole.includes(admin.role)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">You don't have permission to access this admin page.</p>
          <a href="/admin" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-2xl transition-all">
            Go Back
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;


