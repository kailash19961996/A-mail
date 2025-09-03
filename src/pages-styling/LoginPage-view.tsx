import React from 'react';
import { Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import Loader from '../components/Loader';

type AuthMethod = 'email' | 'sms';
type Mode = 'email-input' | 'auth-method-selection' | 'otp-input';

export interface LoginPageViewProps {
  mode: Mode;
  isLoading: boolean;
  error: string;

  email: string;
  onEmailChange: (value: string) => void;
  isEmailValid: boolean;
  emailError: string;
  onEmailSubmit: (e: React.FormEvent) => void;

  loginData: {
    user_id: string;
    auth_options: string[];
    sms_otp_num: string | null;
  } | null;
  onRequestOtp: (userId: string, method: AuthMethod) => void;
  onBackToEmail: () => void;


  otpData: {
    user_id: string;
    otp_method: AuthMethod;
    otp_code_expire: number;
  } | null;
  otpCode: string;
  onOtpChange: (value: string) => void;
  onOtpSubmit: (e: React.FormEvent) => void;
  selectedAuthMethod: AuthMethod;
  timeRemaining: number;
  formatTime: (seconds: number) => string;
}

const LoginPageView: React.FC<LoginPageViewProps> = (props) => {
  const {
    mode,
    isLoading,
    error,
    email,
    onEmailChange,
    isEmailValid,
    emailError,
    onEmailSubmit,
    loginData,
    onRequestOtp,
    onBackToEmail,

    otpData,
    otpCode,
    onOtpChange,
    onOtpSubmit,
    selectedAuthMethod,
    timeRemaining,
    formatTime,
  } = props;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif" }}>
      <div className="w-full max-w-sm min-w-[330px] rounded-3xl glass-card p-6 shadow-2xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <img
              src="/logo-no-bg-500px.png"
              alt="BlueLion Claims"
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">BlueLion Claims Portal</h1>
          <p className="text-gray-600 text-sm">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {mode === 'email-input' && (
          <div className="glass-panel rounded-2xl p-6 mb-8">
            <form onSubmit={onEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="input-icon h-5 w-5" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/60 backdrop-blur-sm text-sm ${
                      emailError ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="Enter your Email Address"
                    required
                  />
                </div>
                {emailError && (
                  <div className="mt-3 text-xs text-red-600 bg-red-50 px-4 py-3 rounded-lg border border-red-200">
                    {emailError}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !isEmailValid}
                className={`w-full py-3 px-5 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 ${
                  isEmailValid && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                }`}
              >
                {isLoading ? <Loader size="sm" text="" /> : 'Continue'}
              </button>
            </form>
          </div>
        )}

        {mode === 'auth-method-selection' && loginData && (
          <div className="glass-panel rounded-2xl p-6 mb-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Choose how to receive your OTP
              </h3>
            </div>

            <div className="space-y-6">
              <button
                onClick={() => onRequestOtp(loginData.user_id, 'email')}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
              >
                <span className="text-lg">📧</span>
                <span>Send OTP to Email</span>
              </button>

              {loginData.sms_otp_num !== null && (
                <button
                  onClick={() => onRequestOtp(loginData.user_id, 'sms')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
                >
                  <span className="text-lg">📱</span>
                  <span>
                    Send OTP to Mobile
                    {loginData.sms_otp_num && loginData.sms_otp_num.trim().length > 0
                      ? ` (${loginData.sms_otp_num})`
                      : ''}
                  </span>
                </button>
              )}
            </div>
            
            <div className="text-center pt-8 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onBackToEmail}
                className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center justify-center mx-auto transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Email Input
              </button>
            </div>
          </div>
        )}

        {mode === 'otp-input' && otpData && (
          <div className="glass-panel rounded-2xl p-6 mb-8">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Enter Verification Code
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                {selectedAuthMethod === 'sms' 
                  ? 'Please enter the OTP sent to your SMS'
                  : 'Please enter the OTP sent to your email'
                }
              </p>
              <p className="text-sm text-blue-600 font-medium">
                OTP expires in: <span className="font-bold text-base">{formatTime(timeRemaining)}</span>
              </p>
            </div>

            <form onSubmit={onOtpSubmit} className="space-y-6">
              <div>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={otpCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) {
                      onOtpChange(value);
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-base tracking-widest bg-gray-50/50 font-mono"
                  placeholder="Enter OTP"
                  maxLength={6}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-5 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 flex items-center justify-center space-x-3"
              >
                {isLoading ? (
                  <Loader size="sm" text="" />
                ) : (
                  <>
                    <span className="text-lg">✅</span>
                    <span>Verify Code</span>
                  </>
                )}
              </button>

              <div className="flex flex-col items-center space-y-3 pt-4">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 underline font-medium">
                  Resend OTP
                </a>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPageView;


