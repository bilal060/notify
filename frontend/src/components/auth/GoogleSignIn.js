import React from 'react';
import useGoogleSignIn from '../../hooks/useGoogleSignIn';
import './GoogleSignIn.css';

const GoogleSignIn = ({ onSuccess, onError, className = '' }) => {
  const {
    isLoading,
    error,
    user,
    isSignedIn,
    signOut,
    promptSignIn,
    isGoogleLoaded,
  } = useGoogleSignIn();

  const handleSignInSuccess = (result) => {
    if (onSuccess) {
      onSuccess(result);
    }
  };

  const handleSignInError = (error) => {
    if (onError) {
      onError(error);
    }
  };

  // Show loading state while Google script loads
  if (!isGoogleLoaded) {
    return (
      <div className={`google-signin-container ${className}`}>
        <div className="google-signin-loading">
          <div className="spinner"></div>
          <p>Loading Google Sign-In...</p>
        </div>
      </div>
    );
  }

  // Show signed-in state
  if (isSignedIn) {
    return (
      <div className={`google-signin-container ${className}`}>
        <div className="google-user-info">
          <img 
            src={user?.picture} 
            alt={user?.name} 
            className="google-user-avatar"
          />
          <div className="google-user-details">
            <h4>{user?.name}</h4>
            <p>{user?.email}</p>
          </div>
          <button 
            onClick={signOut}
            className="google-signout-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    );
  }

  // Show sign-in state
  return (
    <div className={`google-signin-container ${className}`}>
      {error && (
        <div className="google-signin-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}
      
      <div className="google-signin-content">
        <div className="google-signin-header">
          <h3>Sign in with Google</h3>
          <p>Access your account securely</p>
        </div>
        
        <div id="google-signin-button"></div>
        
        <div className="google-signin-alternative">
          <button 
            onClick={promptSignIn}
            className="google-prompt-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Use Google Account'}
          </button>
        </div>
        
        <div className="google-signin-footer">
          <p>
            By signing in, you agree to our{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleSignIn; 