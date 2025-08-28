import React from 'react';
import { LogOut } from 'lucide-react';

interface HeaderViewProps {
  userFirstName?: string;
  onLogout: () => Promise<void> | void;
}

const HeaderView: React.FC<HeaderViewProps> = ({ userFirstName, onLogout }) => {
  return (
    <header className="glass-card rounded-xl px-4 py-3 shadow-lg border border-white/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src="/logo-no-bg-500px.png" alt="BlueLion Claims" className="h-10 w-auto" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">BlueLion Claims Portal</h1>
            {userFirstName && <p className="text-sm text-gray-600">Welcome, {userFirstName}</p>}
          </div>
        </div>
        <button 
          onClick={() => onLogout()} 
          className="flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:scale-105 text-gray-600"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default HeaderView;


