import React, { useState } from 'react';
import { Plane, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const { signInWithGoogle, error } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setLocalError(null);
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      setLocalError(error.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-[#4ECDC4] to-[#44A08D] p-3 rounded-2xl shadow-lg">
              <Plane className="w-8 h-8 text-white" />
            </div>
            <div className="bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] p-3 rounded-2xl shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Travel Planner</h1>
          <p className="text-gray-600 text-lg">Plan your perfect journey</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-50">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
            Welcome!
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Sign in to access your trips from any device
          </p>

          {/* Error Message */}
          {(error || localError) && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-50/50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">Sign in failed</p>
                <p className="text-sm text-red-600 mt-1">
                  {localError || error}
                </p>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white border-2 border-gray-300 hover:border-[#4ECDC4] text-gray-700 font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-300 border-t-[#4ECDC4] rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Features List */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-900 mb-4">
              With your account you can:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#4ECDC4]/20 to-[#4ECDC4]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#4ECDC4]"></div>
                </div>
                <span>Access your trips from any device</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FF6B6B]/20 to-[#FF6B6B]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#FF6B6B]"></div>
                </div>
                <span>Never lose your travel data</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#FFE66D]/20 to-[#FFE66D]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#F7B731]"></div>
                </div>
                <span>Plan trips seamlessly across phone and desktop</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          By signing in, you agree to sync your data with Firebase
        </p>
      </div>
    </div>
  );
};

export default Login;
