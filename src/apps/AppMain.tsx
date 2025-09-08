import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { dev_log } from '../utils/coreUtils';
import InDevelopment from '../components/InDevelopment';
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

  // Redirect to tickets if accessing root
  useEffect(() => {
    if (location.pathname === '/') {
      dev_log('🎟️ Root path detected, redirecting to tickets...');
      navigate('/tickets');
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
              <Route path="/home" element={<InDevelopment title="Home" />} />
              
              {/* Validation Screens (placeholder) */}
              <Route path="/validate/client-review" element={<InDevelopment title="Client Review" />} />
              <Route path="/validate/id-review" element={<InDevelopment title="ID Review" />} />
              
              {/* Review Screens (placeholder) */}
              <Route path="/review/sar" element={<InDevelopment title="SAR Review" />} />
              <Route path="/review/presub" element={<InDevelopment title="PreSub Review" />} />
              <Route path="/review/floc" element={<InDevelopment title="FLOC Review" />} />
              
              {/* All Data Routes (placeholder) */}
              <Route path="/all-clients" element={<InDevelopment title="All Clients" />} />
              <Route path="/all-cases" element={<InDevelopment title="All Cases" />} />
              
              {/* Admin Routes (placeholder) */}
              <Route path="/admin/config" element={<InDevelopment title="General Config" />} />
              <Route path="/admin/templates" element={<InDevelopment title="Templates Config" />} />
              <Route path="/admin/lenders" element={<InDevelopment title="Lenders Config" />} />
              <Route path="/admin/actions" element={<InDevelopment title="Actions Config" />} />
              <Route path="/admin/users" element={<InDevelopment title="User Management" />} />
              
              {/* Legacy Routes - Redirect to tickets */}
              <Route path="/cases" element={<Navigate to="/all-cases" replace />} />
              <Route path="/admin" element={<Navigate to="/admin/config" replace />} />
              
              {/* Default Route */}
              <Route path="*" element={<Navigate to="/tickets" replace />} />
            </Routes>
                      )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppMain; 