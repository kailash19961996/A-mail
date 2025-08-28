import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Smartphone, ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import Loader from '../components/Loader';
import { createApiInstance, dev_log } from '../utils/coreUtils';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const api = createApiInstance();
  
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
      dev_log('📡 Making login API call to /login');
      const response = await api.post('/login', { email });
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
      dev_log('📡 Making OTP request API call to /otp-request');
      const response = await api.post('/otp-request', { user_id: userId, otp_method: method });
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
      dev_log('📡 Making OTP verification API call to /otp-verify');
      await api.post('/otp-verify', {
        user_id: otpData.user_id,
        otp_code: otpCode,
        otp_method: otpData.otp_method
      });
      
      dev_log('✅ OTP verification successful, navigating to home...');
      // Success - navigate to home (AuthContext will handle the rest)
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
    let interval: ReturnType<typeof setTimeout>;
    
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

    return () => clearInterval(interval);
  }, [mode, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================================================
  // ERROR HANDLING & NAVIGATION
  // ============================================================================

  const handleError = (errorMessage: string) => {
    dev_log('🚫 Handling error:', errorMessage);
    setError(errorMessage);
    setMode('email-input');
    setEmail('');
    setOtpCode('');
    setLoginData(null);
    setOtpData(null);
    setTimeRemaining(0);
  };

  const handleRestart = () => {
    dev_log('🔄 Restarting login process');
    handleError('');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/logo-no-bg-500px.png"
              alt="BlueLion Claims"
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">BlueLion Claims Portal</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {/* Email Input Form */}
        {mode === 'email-input' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    emailError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isEmailValid}
              className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                isEmailValid
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              {isLoading ? <Loader size="sm" text="" /> : 'Continue'}
            </button>
          </form>
        )}

        {/* Auth Method Selection */}
        {mode === 'auth-method-selection' && loginData && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                Choose how you'd like to authenticate
              </p>
            </div>

            <button
              onClick={() => handleOtpRequest(loginData.user_id, 'email')}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 p-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Mail className="h-5 w-5 text-gray-600" />
              <span>Use Email Address</span>
            </button>

            {loginData.sms_otp_num && (
              <button
                onClick={() => handleOtpRequest(loginData.user_id, 'sms')}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 p-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Smartphone className="h-5 w-5 text-gray-600" />
                <span>Use SMS ({loginData.sms_otp_num})</span>
              </button>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={handleRestart}
                className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center justify-center mx-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Email Input
              </button>
            </div>
          </div>
        )}

        {/* OTP Input Form */}
        {mode === 'otp-input' && otpData && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">
                {selectedAuthMethod === 'sms' 
                  ? 'Enter the code sent to your mobile number'
                  : 'Enter the code sent to your email address'
                }
              </p>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                Code expires in: {formatTime(timeRemaining)}
              </div>
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) {
                    setOtpCode(value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <Loader size="sm" text="" /> : 'Verify Code'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleRestart}
                className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center justify-center mx-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Start Over
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage; 