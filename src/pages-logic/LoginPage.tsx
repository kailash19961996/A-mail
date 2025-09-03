import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createApiInstance, dev_log } from '../utils/coreUtils';
import { useAuth } from '../contexts/AuthContext';
import LoginPageView from '../pages-styling/LoginPage-view';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const api = createApiInstance();
  const { setAuthState } = useAuth();
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Form states
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  // UI states
  const [mode, setMode] = useState<'email-input' | 'auth-method-selection' | 'otp-input'>('email-input');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Login response data
  const [loginData, setLoginData] = useState<{
    user_id: string;
    auth_options: string[];
    sms_otp_num: string | null;
  } | null>(null);
  
  const [otpData, setOtpData] = useState<{
    user_id: string;
    otp_method: 'email' | 'sms';
    otp_code_expire: number;
  } | null>(null);
  
  // Timer states
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<'email' | 'sms'>('email');
  
  // Validation states
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);

  // ============================================================================
  // EMAIL VALIDATION & SUBMISSION
  // ============================================================================

  // Check email validity when email changes
  useEffect(() => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      setIsEmailValid(false);
    } else {
      setEmailError('');
      setIsEmailValid(email.length > 0);
    }
  }, [email]);

  // Log email validation changes
  useEffect(() => {
    dev_log('📧 Email validation:', { email, isValid: isEmailValid, error: emailError });
  }, [email, isEmailValid, emailError]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) return;

    dev_log('🔐 Starting login process for email:', email);
    setIsLoading(true);
    setError('');

    try {
      dev_log('📡 Making login API call to /user-access/login');
      const response = await api.post('/user-access/login', { email });
      const data = response.data;
      dev_log('✅ Login response received:', data);
      setLoginData(data);
      
      if (data.sms_otp_num === null) {
        dev_log('📧 Only email OTP available, automatically requesting...');
        // Only email available, automatically request OTP
        await handleOtpRequest(data.user_id, 'email');
      } else {
        dev_log('📱 Both SMS and email available, showing method selection');
        // Both SMS and email available, show selection
        setMode('auth-method-selection');
      }
    } catch (error: unknown) {
      dev_log('💥 Login error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { responseMsg?: string } } };
        if (apiError.response?.status === 401 || apiError.response?.status === 400) {
          const customMessage = apiError.response?.data?.responseMsg || 'Login failed';
          dev_log('🚫 Login failed with custom message:', customMessage);
          setError(customMessage);
        } else {
          setError('Unknown error occurred. Please contact administrator on xxx@bluelionclaims.co.uk');
        }
      } else {
        setError('Unknown error occurred. Please contact administrator on xxx@bluelionclaims.co.uk');
      }
      setMode('email-input');
    } finally {
      setIsLoading(false);
      dev_log('🏁 Login process completed');
    }
  };

  // ============================================================================
  // OTP REQUEST & VERIFICATION
  // ============================================================================

  const handleOtpRequest = async (userId: string, method: 'email' | 'sms') => {
    dev_log('📱 Requesting OTP:', { userId, method });
    setIsLoading(true);
    setError('');
    setSelectedAuthMethod(method);

    try {
      dev_log('📡 Making OTP request API call to /user-access/otp-request');
      const response = await api.post('/user-access/otp-request', { user_id: userId, otp_method: method });
      const data = response.data;
      dev_log('✅ OTP request response received:', data);
      setOtpData(data);
      setTimeRemaining(data.otp_code_expire - Math.floor(Date.now() / 1000));
      setMode('otp-input');
      dev_log('⏰ OTP expires in:', data.otp_code_expire, 'seconds');
    } catch (error: unknown) {
      dev_log('💥 OTP request error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { responseMsg?: string } } };
        if (apiError.response?.status === 401 || apiError.response?.status === 400) {
          const customMessage = apiError.response?.data?.responseMsg || 'OTP request failed';
          dev_log('🚫 OTP request failed with custom message:', customMessage);
          setError(customMessage);
        } else {
          setError('Unknown error occurred. Please contact administrator on xxx@bluelionclaims.co.uk');
        }
      } else {
        setError('Unknown error occurred. Please contact administrator on xxx@bluelionclaims.co.uk');
      }
      setMode('email-input');
    } finally {
      setIsLoading(false);
      dev_log('🏁 OTP request process completed');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6 || !otpData) return;

    dev_log('🔐 Verifying OTP code:', { userId: otpData.user_id, method: otpData.otp_method, codeLength: otpCode.length });
    setIsLoading(true);
    setError('');

    try {
      dev_log('📡 Making OTP verification API call to /user-access/otp-verify');
      await api.post('/user-access/otp-verify', {
        user_id: otpData.user_id,
        otp_code: otpCode,
        otp_method: otpData.otp_method
      });
      
      dev_log('✅ OTP verification successful, setting auth state and navigating to home...');
      
      // Create temporary user data - will be updated by auth-check API call
      // This allows immediate authentication while the real user data loads
      const userData = {
        user_id: loginData!.user_id,
        first_name: 'Loading...', // Will be updated by auth-check
        display_name: 'Loading...', // Will be updated by auth-check
        user_type: 'CaseHandler' as const, // Will be updated by auth-check
        user_roles: ['*'], // Temporary wildcard access, will be updated by auth-check
        auth_status: 'Valid Auth'
      };
      
      dev_log('🔧 Setting temporary auth state for immediate access:', userData);
      setAuthState(userData);
      
      // Navigate to home - auth-check will run and update user data
      navigate('/home');
    } catch (error: unknown) {
      dev_log('💥 OTP verification error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { status?: number; data?: { responseMsg?: string } } };
        if (apiError.response?.status === 401 || apiError.response?.status === 400) {
          const customMessage = apiError.response?.data?.responseMsg || 'OTP verification failed';
          dev_log('🚫 OTP verification failed with custom message:', customMessage);
          setError(customMessage);
        } else {
          setError('Unknown error occurred. Please contact administrator on xxx@bluelionclaims.co.uk');
        }
      } else {
        setError('Unknown error occurred. Please contact administrator on xxx@bluelionclaims.co.uk');
      }
      setMode('email-input');
    } finally {
      setIsLoading(false);
      dev_log('🏁 OTP verification process completed');
    }
  };

  // ============================================================================
  // TIMER & UTILITIES
  // ============================================================================

  // Timer countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (mode === 'otp-input' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            dev_log('⏰ OTP code expired, returning to email input');
            // Time expired, go back to email input
            setError('Code expired. Please try again.');
            setMode('email-input');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]); // Remove timeRemaining dependency to prevent interval recreation

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================================
  // ERROR HANDLING & NAVIGATION
  // ============================================================================





  const handleBackToEmail = () => {
    dev_log('🔙 Going back to email input');
    setMode('email-input');
    setLoginData(null);
    setError('');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <LoginPageView
      mode={mode}
      isLoading={isLoading}
      error={error}
      email={email}
      onEmailChange={setEmail}
      isEmailValid={isEmailValid}
      emailError={emailError}
      onEmailSubmit={handleEmailSubmit}
      loginData={loginData}
      onRequestOtp={handleOtpRequest}
      onBackToEmail={handleBackToEmail}
      otpData={otpData}
      otpCode={otpCode}
      onOtpChange={setOtpCode}
      onOtpSubmit={handleOtpSubmit}
      selectedAuthMethod={selectedAuthMethod}
      timeRemaining={timeRemaining}
      formatTime={formatTime}
    />
  );
};

export default LoginPage; 