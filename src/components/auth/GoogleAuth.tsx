/**
 * Google OAuth Authentication Component - Domain Analysis
 * Adapted for Next.js with FastAPI backend integration
 */

import React, { useState, useEffect, createContext, useContext } from 'react';

// Types
interface GoogleUser {
  email: string;
  name: string;
  picture: string;
  sub: string;
}

interface User {
  email: string;
  name: string;
  profile_picture: string;
  access_status: 'Pending' | 'Granted' | 'Denied';
  login_count: number;
  existing_user: boolean;
}

interface AuthContextType {
  user: User | null;
  googleUser: GoogleUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasAccess: boolean;
  error: string | null;
  signIn: () => void;
  signOut: () => void;
}

// Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

// Configuration
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://domain-analysis-backend-456664817971.europe-west1.run.app';

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google OAuth
  useEffect(() => {
    const initializeGoogleAuth = async () => {
      try {
        await loadGoogleScript();
        
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn,
            auto_select: false,
            cancel_on_tap_outside: false,
          });

          // Check for existing session
          const savedUser = localStorage.getItem('domain_analysis_user');
          const savedGoogleUser = localStorage.getItem('domain_analysis_google_user');
          
          if (savedUser && savedGoogleUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              const parsedGoogleUser = JSON.parse(savedGoogleUser);
              
              // Verify the user's current status
              await verifyUserStatus(parsedUser.email);
              
              setUser(parsedUser);
              setGoogleUser(parsedGoogleUser);
            } catch (err) {
              // Clear invalid cached data
              localStorage.removeItem('domain_analysis_user');
              localStorage.removeItem('domain_analysis_google_user');
              localStorage.removeItem('google_credential');
            }
          }
        }
      } catch (err) {
        setError('Failed to initialize Google authentication');
        console.error('Google Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGoogleAuth();
  }, []);

  const loadGoogleScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google script'));
      document.head.appendChild(script);
    });
  };

  const verifyUserStatus = async (email: string) => {
    try {
      const response = await fetch(`/api/auth/status?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(prevUser => prevUser ? { ...prevUser, access_status: userData.access_status } : null);
      }
    } catch (err) {
      console.error('Status verification failed:', err);
    }
  };

  const handleGoogleSignIn = async (response: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Store Google credential
      const credential = response.credential;
      
      // Decode the JWT manually (basic decode for display info)
      const payload = JSON.parse(atob(credential.split('.')[1]));
      const googleUserInfo: GoogleUser = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub
      };

      setGoogleUser(googleUserInfo);
      localStorage.setItem('domain_analysis_google_user', JSON.stringify(googleUserInfo));
      localStorage.setItem('google_credential', credential);

      // Register with Next.js API route
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: googleUserInfo.email,
          name: googleUserInfo.name,
          profile_picture: googleUserInfo.picture,
          google_token: credential
        }),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const userData: User = await registerResponse.json();
      setUser(userData);
      localStorage.setItem('domain_analysis_user', JSON.stringify(userData));

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      console.error('Authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = () => {
    setError(null);
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setError('Google authentication not available');
    }
  };

  const signOut = () => {
    setUser(null);
    setGoogleUser(null);
    localStorage.removeItem('domain_analysis_user');
    localStorage.removeItem('domain_analysis_google_user');
    localStorage.removeItem('google_credential');
    
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const contextValue: AuthContextType = {
    user,
    googleUser,
    isLoading,
    isAuthenticated: !!googleUser,
    hasAccess: user?.access_status === 'Granted',
    error,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Google Sign-In Button Component
export const GoogleSignInButton: React.FC = () => {
  const { signIn, isLoading } = useAuth();

  return (
    <button
      onClick={signIn}
      disabled={isLoading}
      className="w-full max-w-md mx-auto flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {isLoading ? 'Signing in...' : 'Sign in with Google'}
    </button>
  );
};

// Access Status Component
export const AccessStatus: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return null;

  const getStatusMessage = () => {
    switch (user.access_status) {
      case 'Granted':
        return {
          message: '✅ Access granted! You can use the domain analysis system.',
          color: 'text-green-600 bg-green-50 border-green-200',
        };
      case 'Pending':
        return {
          message: '⏳ Your access request is pending admin approval. Please wait for confirmation.',
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        };
      case 'Denied':
        return {
          message: '❌ Access has been denied. Please contact the administrator for more information.',
          color: 'text-red-600 bg-red-50 border-red-200',
        };
      default:
        return {
          message: '❓ Unknown access status. Please contact support.',
          color: 'text-gray-600 bg-gray-50 border-gray-200',
        };
    }
  };

  const { message, color } = getStatusMessage();

  return (
    <div className={`p-4 rounded-lg border ${color} max-w-md mx-auto text-center`}>
      <p className="font-medium">{message}</p>
      {user.existing_user && (
        <p className="text-sm mt-2 opacity-75">
          Welcome back! You've logged in {user.login_count} times.
        </p>
      )}
    </div>
  );
};

// User Profile Component
export const UserProfile: React.FC = () => {
  const { googleUser, signOut } = useAuth();

  if (!googleUser) return null;

  return (
    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm border">
      <img
        src={googleUser.picture}
        alt={googleUser.name}
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1">
        <p className="font-medium text-gray-900">{googleUser.name}</p>
        <p className="text-sm text-gray-600">{googleUser.email}</p>
      </div>
      <button
        onClick={signOut}
        className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-100 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
};

// Main Auth Component
export const AuthComponent: React.FC = () => {
  const { isAuthenticated, hasAccess, isLoading, error, googleUser } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-red-600 mb-4">{error}</p>
          <GoogleSignInButton />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <img
              src="https://gemengserv.com/wp-content/uploads/2021/04/GEM-Engserv-Pvt-Ltd-logo-updated.png"
              alt="GemEngserv Logo"
              className="h-16 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Domain Analysis</h1>
            <p className="text-gray-600">Sign in to access business intelligence tools</p>
          </div>
          
          <GoogleSignInButton />
          
          <p className="text-xs text-gray-500 text-center mt-6">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <img
              src="https://gemengserv.com/wp-content/uploads/2021/04/GEM-Engserv-Pvt-Ltd-logo-updated.png"
              alt="GemEngserv Logo"
              className="h-16 mx-auto mb-4"
            />
          </div>
          
          <UserProfile />
          
          <div className="mt-6">
            <AccessStatus />
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Need access?</h3>
            <p className="text-sm text-gray-600">
              Please contact your administrator to request access to the domain analysis system.
              Include your email address: <span className="font-mono bg-gray-200 px-1 rounded">{googleUser?.email}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Global type declaration
declare global {
  interface Window {
    google: any;
  }
}