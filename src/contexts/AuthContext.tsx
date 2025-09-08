import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { type User, dev_log } from '../utils/coreUtils';

/* eslint-disable react-refresh/only-export-components */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  setAuthState: (userData: User) => void; // Add function to manually set auth state
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// ============================================================================
// MAIN PROVIDER COMPONENT
// ============================================================================

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Placeholder user for open source release
  const placeholderUser: User = {
    user_id: 'placeholder-kailash',
    first_name: 'Kailash',
    display_name: 'Kailash',
    email: 'kylasben@gmail.com',
    user_type: 'CaseHandler',
    user_roles: ['*'],
    auth_status: 'Placeholder Auth',
  };

  const [user, setUser] = useState<User | null>(placeholderUser);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================================
  // AUTHENTICATION FUNCTIONS
  // ============================================================================

  const checkAuth = useCallback(async (): Promise<boolean> => {
    // Open-source placeholder: always authenticated
    dev_log('🔐 Skipping backend auth-check (open-source placeholder).');
    setIsAuthenticated(true);
    if (!user) {
      setUser(placeholderUser);
    }
    setIsLoading(false);
    return true;
  }, [user]);

  const logout = async (): Promise<void> => {
    dev_log('🚪 Logout requested (open-source placeholder).');
    try {
      // No backend calls in open-source build
    } finally {
      dev_log('🧹 Resetting to placeholder user...');
      setUser(placeholderUser);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('auth_email', placeholderUser.email);
      } catch {}
      dev_log('🔄 Navigating to tickets page...');
      navigate('/tickets');
    }
  };

  // Function to manually set auth state (used after successful OTP verification)
  const setAuthState = useCallback((userData: User) => {
    dev_log('🔧 Manually setting auth state:', userData);
    try {
      if ((userData as any).email) {
        localStorage.setItem('auth_email', (userData as any).email as string);
      }
    } catch {}
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Seed placeholder user/email on mount
  useEffect(() => {
    dev_log('🚀 AuthContext initialized (open-source placeholder auth).');
    try {
      localStorage.setItem('auth_email', placeholderUser.email);
    } catch {}
    setUser(placeholderUser);
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    logout,
    checkAuth,
    setAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================================
// CONTEXT HOOK
// ============================================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 