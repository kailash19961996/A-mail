import axios from 'axios';

// Environment-based API configuration
export const getApiConfig = () => {
  const isProduction = import.meta.env.VITE_IS_PRODUCTION === 'true';
  const baseURL = isProduction 
    ? 'https://api.bluelionclaims.co.uk/internal'
    : 'https://beta-api.bluelionclaims.co.uk/internal';

  return {
    baseURL,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  };
};

// Development logging function - only logs in beta environment
export const dev_log = (...args: unknown[]) => {
  const isProduction = import.meta.env.VITE_IS_PRODUCTION === 'true';
  if (!isProduction) {
    console.log('[DEV]', ...args);
  }
};

// Create axios instance with common configuration
export const createApiInstance = () => {
  const config = getApiConfig();
  dev_log('🌐 Creating API instance with config:', config);
  return axios.create(config);
};

// Common API response interface
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  responseMsg?: string;
}

// Common user interface
export interface User {
  user_id: string;
  first_name: string;
  display_name: string;
  user_type: 'SysAdmin' | 'Admin' | 'CaseHandler';
  user_roles: string[];
  auth_status: string;
} 