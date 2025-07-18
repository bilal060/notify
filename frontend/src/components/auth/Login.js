import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleSignIn, setShowGoogleSignIn] = useState(false);
  const navigate = useNavigate();

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && process.env.REACT_APP_GOOGLE_CLIENT_ID) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignInSuccess,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate a device ID for web access
      const deviceId = `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const data = await api.post('/api/auth/signin', {
        email,
        password,
        deviceId
      });

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        toast.success('Login successful!');
        
        // Navigate to dashboard based on user role
        if (data.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInSuccess = async (response) => {
    setGoogleLoading(true);
    
    try {
      console.log('Google Sign-In response:', response);
      
      // Extract the ID token from the response
      const idToken = response.credential;
      
      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      // Decode the JWT token to get user data
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      const userData = {
        email: payload.email,
        googleId: payload.sub,
        name: payload.name,
        picture: payload.picture
      };

      // Send the credential and user data to your backend for verification
      const data = await api.post('/api/auth/google-signin', {
        credential: idToken,
        userData: userData
      });

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast.success('Google Sign-In successful!');
        
        // Navigate based on user role
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        throw new Error(data.message || 'Google Sign-In failed');
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      toast.error('Google Sign-In failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignInClick = () => {
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    } else {
      toast.error('Google Sign-In not available. Please try again.');
    }
  };

  return (
    <div className="auth-container" style={{
      maxWidth: '400px',
      margin: '50px auto',
      padding: '30px',
      border: '2px solid #667eea',
      borderRadius: '10px',
      backgroundColor: '#fff',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#667eea', marginBottom: '10px' }}>🔐 Welcome Back</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Sign in to access your dashboard and manage your data.
        </p>
        <p style={{ color: '#999', fontSize: '12px', marginTop: '10px' }}>
          Environment: {process.env.REACT_APP_ENV || 'development'}
        </p>
      </div>
      
      <div className="login-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="login-divider">
          <span>or</span>
        </div>
        
        <div className="google-signin-section">
          <button 
            onClick={handleGoogleSignInClick}
            className="google-toggle-btn"
            disabled={googleLoading}
            style={{
              background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              width: '100%',
              marginBottom: '15px'
            }}
          >
            {googleLoading ? 'Signing in with Google...' : 'Sign in with Google'}
          </button>
          
          <div className="google-signin-wrapper">
            <p style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginBottom: '15px' }}>
              Google Sign-In is available for all users.
            </p>
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '6px',
              textAlign: 'center',
              color: '#666'
            }}>
              <p>✅ Google Sign-In is configured and ready!</p>
              <p style={{ fontSize: '12px', marginTop: '10px' }}>
                Client ID: {process.env.REACT_APP_GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="login-footer">
        <div className="footer-links">
          <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          <span className="footer-separator">|</span>
          <Link to="/terms" className="footer-link">Terms of Service</Link>
        </div>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '5px',
        fontSize: '12px',
        color: '#666'
      }}>
        <strong>ℹ️ Information:</strong> This system helps you manage your data and monitor your devices. 
        All access is logged for security purposes.
      </div>
    </div>
  );
};

export default Login; 