import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import GoogleSignIn from './GoogleSignIn';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate a device ID for admin web access
      const deviceId = `admin-web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const data = await api.post('/api/auth/signin', {
        email,
        password,
        deviceId
      });

      if (data.success) {
        // Check if user is admin
        if (!data.data.user.isAdmin && data.data.user.role !== 'admin') {
          toast.error('Access denied. Admin privileges required.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }

        // Store token in localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        toast.success('Admin login successful! Fetching emails...');
        
        // Navigate to admin dashboard
        navigate('/admin');
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

  return (
    <div className="auth-container" style={{
      maxWidth: '400px',
      margin: '50px auto',
      padding: '30px',
      border: '2px solid #e74c3c',
      borderRadius: '10px',
      backgroundColor: '#fff',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#e74c3c', marginBottom: '10px' }}>🔐 Admin Access Only</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>
          This dashboard is restricted to authorized administrators only.
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
        
        <GoogleSignIn 
          onSuccess={(result) => {
            console.log('Google Sign-In successful:', result);
            // The hook will handle the login through AuthContext
          }}
          onError={(error) => {
            console.error('Google Sign-In error:', error);
            // setError(error); // This line was not in the new_code, so it's removed.
          }}
          className="google-signin-wrapper"
        />
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
        <strong>⚠️ Security Notice:</strong> This system is for authorized personnel only. 
        All access attempts are logged and monitored.
      </div>
    </div>
  );
};

export default Login; 