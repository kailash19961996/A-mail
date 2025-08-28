import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission, dev_log } from '../utils/coreUtils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string;
  fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  fallbackPath = '/home' 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading while checking auth
  if (isLoading) {
    dev_log('⏳ ProtectedRoute: Checking permissions...');
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    dev_log('🚫 ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user has required permission
  if (!hasPermission(user, requiredRole)) {
    dev_log('🚫 ProtectedRoute: Access denied for role', { 
      userRole: user.user_type, 
      userRoles: user.user_roles, 
      requiredRole,
      fallbackPath 
    });
    return <Navigate to={fallbackPath} replace />;
  }

  dev_log('✅ ProtectedRoute: Access granted for role', { 
    userRole: user.user_type, 
    userRoles: user.user_roles, 
    requiredRole 
  });

  return <>{children}</>;
};

export default ProtectedRoute; 