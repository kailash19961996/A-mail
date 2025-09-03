import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import ProtectedRoute from '../components/ProtectedRoute';
import HomePage from '../pages-logic/HomePage';
import ClientReviewPage from '../pages-logic/validate/ClientReviewPage';
import IdReviewPage from '../pages-logic/validate/IdReviewPage';
import SarReviewPage from '../pages-logic/review/SarReviewPage';
import PreSubReviewPage from '../pages-logic/review/PreSubReviewPage';
import FlocReviewPage from '../pages-logic/review/FlocReviewPage';
import AllClientsPage from '../pages-logic/data/AllClientsPage';
import AllCasesPage from '../pages-logic/data/AllCasesPage';
import GeneralConfigPage from '../pages-logic/admin/GeneralConfigPage';
import TemplatesConfigPage from '../pages-logic/admin/TemplatesConfigPage';
import LendersConfigPage from '../pages-logic/admin/LendersConfigPage';
import ActionsConfigPage from '../pages-logic/admin/ActionsConfigPage';
import UserManagement from '../pages-logic/admin/UserManagement';
import { ROLES, dev_log } from '../utils/coreUtils';
import TicketsApp from '../tickets/TicketsApp';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AppMain: React.FC = () => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  
  const { user, isAuthenticated, checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Check authentication on route change
  useEffect(() => {
    const verifyAuth = async () => {
      dev_log('🔄 Route change detected, verifying authentication...', location.pathname);
      setIsLoading(true);
      const isAuth = await checkAuth();
      if (!isAuth) {
        dev_log('❌ Authentication failed, redirecting to login...');
        navigate('/login');
        return;
      }
      dev_log('✅ Authentication verified for route:', location.pathname);
      setIsLoading(false);
    };

    // Skip excessive auth checks if already authenticated and user exists
    if (user && isAuthenticated) {
      dev_log('✅ User already authenticated, skipping auth check for route:', location.pathname);
      setIsLoading(false);
      return;
    }

    verifyAuth();
  }, [location.pathname, checkAuth, navigate, user, isAuthenticated]);

  // Redirect to home if accessing root
  useEffect(() => {
    if (location.pathname === '/') {
      dev_log('🏠 Root path detected, redirecting to home...');
      navigate('/home');
    }
  }, [location.pathname, navigate]);

  // ============================================================================
  // EARLY RETURNS
  // ============================================================================

  // If not authenticated, show loader
  if (!isAuthenticated || !user) {
    dev_log('⏳ User not authenticated, showing loader...');
    return <Loader size="lg" text="Verifying authentication..." />;
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen relative">
      {/* Content Container */}
      <div className="relative z-10 flex min-h-screen w-full p-4 gap-4">
        {/* Sidebar Container */}
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Main Content Container */}
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Header Container - hidden on /tickets */}
          {location.pathname !== '/tickets' && (
            <div className="flex-shrink-0">
              <Header />
            </div>
          )}
          
          {/* Main Content */}
          <main className={`flex-1 ${location.pathname === '/tickets' ? 'overflow-hidden' : 'overflow-y-auto rounded-2xl'}`}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader size="lg" text="Loading content..." />
              </div>
            ) : (
            <Routes>
              {/* Tickets Route - no header */}
              <Route path="/tickets" element={<TicketsApp />} />
              {/* Main Routes - All Users */}
              <Route path="/home" element={<HomePage />} />
              
              {/* Validation Screens */}
              <Route 
                path="/validate/client-review" 
                element={
                  <ProtectedRoute requiredRole={ROLES.REVIEW_CLIENT}>
                    <ClientReviewPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/validate/id-review" 
                element={
                  <ProtectedRoute requiredRole={ROLES.REVIEW_ID}>
                    <IdReviewPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Review Screens */}
              <Route 
                path="/review/sar" 
                element={
                  <ProtectedRoute requiredRole={ROLES.REVIEW_SAR}>
                    <SarReviewPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/review/presub" 
                element={
                  <ProtectedRoute requiredRole={ROLES.REVIEW_PRE_SUB}>
                    <PreSubReviewPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/review/floc" 
                element={
                  <ProtectedRoute requiredRole={ROLES.REVIEW_FLOC}>
                    <FlocReviewPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* All Data Routes */}
              <Route 
                path="/all-clients" 
                element={
                  <ProtectedRoute requiredRole={ROLES.CLIENTS_ALL} fallbackPath="/home">
                    <AllClientsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/all-cases" 
                element={
                  <ProtectedRoute requiredRole={ROLES.CASES_ALL} fallbackPath="/home">
                    <AllCasesPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes - Role-based access */}
              <Route 
                path="/admin/config" 
                element={
                  <ProtectedRoute requiredRole={ROLES.ADMIN_CONFIG}>
                    <GeneralConfigPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/templates" 
                element={
                  <ProtectedRoute requiredRole={ROLES.ADMIN_TEMPLATES}>
                    <TemplatesConfigPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/lenders" 
                element={
                  <ProtectedRoute requiredRole={ROLES.ADMIN_LENDERS}>
                    <LendersConfigPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/actions" 
                element={
                  <ProtectedRoute requiredRole={ROLES.ADMIN_ACTIONS}>
                    <ActionsConfigPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute requiredRole="*">
                    <UserManagement />
                  </ProtectedRoute>
                } 
              />
              
              {/* Legacy Routes - Redirect to home */}
              <Route path="/cases" element={<Navigate to="/all-cases" replace />} />
              <Route path="/admin" element={<Navigate to="/admin/config" replace />} />
              
              {/* Default Route */}
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
                      )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppMain; 