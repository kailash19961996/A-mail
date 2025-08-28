import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import HomePage from '../pages/HomePage';
import ClientReviewPage from '../pages/validate/ClientReviewPage';
import IdReviewPage from '../pages/IdReviewPage';
import SarReviewPage from '../pages/review/SarReviewPage';
import PreSubReviewPage from '../pages/review/PreSubReviewPage';
import FlocReviewPage from '../pages/review/FlocReviewPage';
import AllClientsPage from '../pages/data/AllClientsPage';
import AllCasesPage from '../pages/data/AllCasesPage';
import GeneralConfigPage from '../pages/admin/GeneralConfigPage';
import TemplatesConfigPage from '../pages/admin/TemplatesConfigPage';
import LendersConfigPage from '../pages/admin/LendersConfigPage';
import ActionsConfigPage from '../pages/admin/ActionsConfigPage';

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
      setIsLoading(true);
      const isAuth = await checkAuth();
      if (!isAuth) {
        navigate('/login');
        return;
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, [location.pathname, checkAuth, navigate]);

  // Redirect to home if accessing root
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/home');
    }
  }, [location.pathname, navigate]);

  // ============================================================================
  // EARLY RETURNS
  // ============================================================================

  // If not authenticated, show loader
  if (!isAuthenticated || !user) {
    return <Loader size="lg" text="Verifying authentication..." />;
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader size="lg" text="Loading content..." />
            </div>
          ) : (
            <Routes>
              {/* Main Routes - All Users */}
              <Route path="/home" element={<HomePage />} />
              
              {/* Validation Screens */}
              <Route path="/validate/client-review" element={<ClientReviewPage />} />
              <Route path="/validate/id-review" element={<IdReviewPage />} />
              
              {/* Review Screens */}
              <Route path="/review/sar" element={<SarReviewPage />} />
              <Route path="/review/presub" element={<PreSubReviewPage />} />
              <Route path="/review/floc" element={<FlocReviewPage />} />
              
              {/* All Data Routes */}
              <Route path="/all-clients" element={<AllClientsPage />} />
              <Route path="/all-cases" element={<AllCasesPage />} />
              
              {/* Admin Routes - Only Admin or SysAdmin */}
              <Route path="/admin/config" element={<GeneralConfigPage />} />
              <Route path="/admin/templates" element={<TemplatesConfigPage />} />
              <Route path="/admin/lenders" element={<LendersConfigPage />} />
              <Route path="/admin/actions" element={<ActionsConfigPage />} />
              
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
  );
};

export default AppMain; 