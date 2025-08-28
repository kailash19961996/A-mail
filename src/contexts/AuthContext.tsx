import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApiInstance, type User } from '../utils/coreUtils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
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
  const api = createApiInstance();
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================================
  // AUTHENTICATION FUNCTIONS
  // ============================================================================

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      // Check with API for authentication status
      const response = await api.get('/auth-check');
      
      if (response.status === 200 && response.data.success && response.data.data) {
        setUser(response.data.data);
        setIsAuthenticated(true);
        return true;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error: unknown) {
      // Handle API errors and look for custom error messages
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { responseMsg?: string } } };
        
        // Check if it's a 400 or 401 error and look for custom message
        if (apiError.response?.status === 400 || apiError.response?.status === 401) {
          const customMessage = apiError.response?.data?.responseMsg;
          console.log('Auth check failed:', customMessage || 'Authentication check failed');
        }
      }
      
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const logout = async (): Promise<void> => {
    try {
      await api.post('/logout', {});
    } catch (error: unknown) {
      // Handle API errors and look for custom error messages
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { responseMsg?: string } } };
        
        // Check if it's a 400 or 401 error and look for custom message
        if (apiError.response?.status === 400 || apiError.response?.status === 401) {
          const customMessage = apiError.response?.data?.responseMsg;
          console.log('Logout failed:', customMessage || 'Logout failed');
        }
      }
      // Continue with logout even if API call fails
    } finally {
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      
      // Navigate to login
      navigate('/login');
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Run auth check immediately when context is created
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    logout,
    checkAuth,
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