import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Loader from './components/Loader';
import './App.css';
import { dev_log } from './utils/coreUtils';

// Lazy load the main app components
const AppLogin = lazy(() => import('./apps/AppLogin'));
const AppMain = lazy(() => import('./apps/AppMain'));

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  dev_log('🎭 AppContent render - Auth state:', { isAuthenticated, isLoading });

  // Show loader while auth is being checked
  if (isLoading) {
    dev_log('⏳ Showing auth verification loader...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader size="lg" text="Verifying authentication..." />
      </div>
    );
  }

  // Only render the appropriate app after auth check is complete
  dev_log('🎯 Rendering app based on auth state:', isAuthenticated ? 'AppMain' : 'AppLogin');
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader size="lg" text="Loading application..." />
      </div>
    }>
      <Routes>
        {isAuthenticated ? (
          <Route path="/*" element={<AppMain />} />
        ) : (
          <Route path="/*" element={<AppLogin />} />
        )}
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
