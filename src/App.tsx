import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Loader from './components/Loader';
import './App.css';
import { dev_log } from './utils/coreUtils';

// Lazy load the main app component
const AppMain = lazy(() => import('./apps/AppMain'));

const App: React.FC = () => {
  dev_log('🎭 App render - Open-source mode with placeholder auth');
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Suspense fallback={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <Loader size="lg" text="Loading application..." />
          </div>
        }>
          <Routes>
            <Route path="/*" element={<AppMain />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default App;
