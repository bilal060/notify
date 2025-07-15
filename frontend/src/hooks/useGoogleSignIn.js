import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const useGoogleSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const { login } = useAuth();

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the sign-in button
        if (document.getElementById('google-signin-button')) {
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            {
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              logo_alignment: 'left',
            }
          );
        }
      }
    };

    // Load Google Sign-In script
    const loadGoogleScript = () => {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleSignIn;
        document.head.appendChild(script);
      } else {
        initializeGoogleSignIn();
      }
    };

    loadGoogleScript();
  }, []);

  // Handle Google Sign-In response
  const handleCredentialResponse = useCallback(async (response) => {
    setIsLoading(true);
    setError(null);

    try {
      // Decode the JWT token
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      // Extract user information
      const userData = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        givenName: payload.given_name,
        familyName: payload.family_name,
        emailVerified: payload.email_verified,
      };

      // Send to backend for verification and account creation
      const backendResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/google-signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential,
          userData,
        }),
      });

      if (!backendResponse.ok) {
        throw new Error('Failed to authenticate with backend');
      }

      const authData = await backendResponse.json();
      
      // Update local state
      setUser(userData);
      
      // Login through auth context
      await login(authData.token, userData);
      
      return { success: true, user: userData, token: authData.token };
    } catch (err) {
      setError(err.message);
      console.error('Google Sign-In Error:', err);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  // Sign out function
  const signOut = useCallback(() => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
      window.google.accounts.id.revoke(user?.googleId, () => {
        setUser(null);
        setError(null);
      });
    }
  }, [user]);

  // Prompt for Google Sign-In
  const promptSignIn = useCallback(() => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    }
  }, []);

  // Check if user is signed in
  const isSignedIn = useCallback(() => {
    return !!user;
  }, [user]);

  // Get user profile
  const getUserProfile = useCallback(() => {
    return user;
  }, [user]);

  // Refresh user data
  const refreshUserData = useCallback(async () => {
    if (!user?.googleId) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/google-profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
      }
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  }, [user]);

  return {
    // State
    isLoading,
    error,
    user,
    isSignedIn: isSignedIn(),
    
    // Actions
    signOut,
    promptSignIn,
    getUserProfile,
    refreshUserData,
    
    // Utility
    isGoogleLoaded: !!window.google?.accounts,
  };
};

export default useGoogleSignIn; 