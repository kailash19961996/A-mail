import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Header: React.FC = () => {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================
  
  const { logout, user } = useAuth();

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleLogout = async () => {
    await logout();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src="/logo-no-bg-500px.png"
            alt="BlueLion Claims"
            className="h-10 w-auto"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">BlueLion Claims Portal</h1>
            {user && (
              <p className="text-sm text-gray-600">Welcome, {user.first_name}</p>
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header; 