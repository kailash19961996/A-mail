import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Loader from './components/Loader';
import './App.css';

// Lazy load the main app components
const AppLogin = lazy(() => import('./apps/AppLogin'));
const AppMain = lazy(() => import('./apps/AppMain'));

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loader while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader size="lg" text="Verifying authentication..." />
      </div>
    );
  }

  // Only render the appropriate app after auth check is complete
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
