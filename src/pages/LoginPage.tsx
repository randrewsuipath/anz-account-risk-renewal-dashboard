import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '../hooks/useAuth';
import { AlertCircle } from 'lucide-react';
export function LoginPage() {
  const { isAuthenticated, isInitializing, login, error } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  useEffect(() => {
    if (isAuthenticated && !isInitializing) {
      navigate('/');
    }
  }, [isAuthenticated, isInitializing, navigate]);
  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } catch (err) {
      setIsLoggingIn(false);
    }
  };
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-8 border border-gray-200">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-10 w-10 rounded-md bg-gradient-to-br from-blue-500 to-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">ANZ Dashboard</h1>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome</h2>
            <p className="text-sm text-gray-600">Sign in with your UiPath account to access the ANZ Account Risk & Renewal Dashboard</p>
          </div>
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-left">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Authentication Error</p>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                Redirecting to UiPath...
              </>
            ) : (
              'Login with UiPath'
            )}
          </Button>
          <p className="text-xs text-gray-500 mt-4">
            By signing in, you agree to access the dashboard using your UiPath Cloud credentials
          </p>
        </div>
      </Card>
    </div>
  );
}