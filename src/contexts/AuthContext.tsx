import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApiInstance, type User, dev_log } from '../utils/coreUtils';

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
  
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false); // Prevent multiple simultaneous auth checks
  const hasInitialAuthCheck = useRef(false); // Track if initial auth check has run

  // ============================================================================
  // AUTHENTICATION FUNCTIONS
  // ============================================================================

  const checkAuth = useCallback(async (): Promise<boolean> => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingAuth) {
      dev_log('⏸️ Auth check already in progress, skipping...');
      return false;
    }
    
    dev_log('🔐 Starting authentication check...');
    setIsCheckingAuth(true);
    
    try {
      // Create API instance only when needed to avoid recreation
      const api = createApiInstance();
      
      // Check with API for authentication status
      dev_log('📡 Making API call to /user-access/auth-check');
      const response = await api.get('/user-access/auth-check');
      
      dev_log('✅ Auth check response:', response.data);
      
      if (response.status === 200 && response.data.success && response.data.data) {
        setUser(response.data.data);
        setIsAuthenticated(true);
        dev_log('🔓 User authenticated successfully:', response.data.data);
        return true;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        dev_log('❌ Auth check failed - invalid response format');
        return false;
      }
    } catch (error: unknown) {
      dev_log('💥 Auth check error:', error);
      // Handle API errors and look for custom error messages
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { responseMsg?: string } } };
        
        // Check if it's a 400 or 401 error and look for custom message
        if (apiError.response?.status === 400 || apiError.response?.status === 401) {
          const customMessage = apiError.response?.data?.responseMsg;
          dev_log('🚫 Auth check failed with custom message:', customMessage || 'Authentication check failed');
        }
      }
      
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
      setIsCheckingAuth(false);
      dev_log('🏁 Auth check completed');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove isCheckingAuth dependency to prevent infinite loops

  const logout = async (): Promise<void> => {
    dev_log('🚪 Starting logout process...');
    try {
      // Create API instance only when needed to avoid recreation
      const api = createApiInstance();
      
      dev_log('📡 Making API call to /user-access/logout');
      await api.post('/user-access/logout', {});
      dev_log('✅ Logout API call successful');
    } catch (error: unknown) {
      dev_log('💥 Logout API error:', error);
      // Handle API errors and look for custom error messages
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { responseMsg?: string } } };
        
        // Check if it's a 400 or 401 error and look for custom message
        if (apiError.response?.status === 400 || apiError.response?.status === 401) {
          const customMessage = apiError.response?.data?.responseMsg;
          dev_log('🚫 Logout failed with custom message:', customMessage || 'Logout failed');
        }
      }
      // Continue with logout even if API call fails
    } finally {
      dev_log('🧹 Resetting authentication state...');
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      
      dev_log('🔄 Navigating to login page...');
      // Navigate to login
      navigate('/login');
    }
  };

  // Function to manually set auth state (used after successful OTP verification)
  const setAuthState = useCallback((userData: User) => {
    dev_log('🔧 Manually setting auth state:', userData);
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Run auth check immediately when context is created (only once)
  useEffect(() => {
    if (!hasInitialAuthCheck.current) {
      dev_log('🚀 AuthContext created, running initial auth check...');
      hasInitialAuthCheck.current = true;
      checkAuth();
    } else {
      dev_log('⏭️ Initial auth check already completed, skipping...');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove checkAuth dependency to prevent infinite loops

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