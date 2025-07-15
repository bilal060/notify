import React from 'react';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { adminAPI } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';
import NetworkStatus from '../common/NetworkStatus';
import ErrorBoundary from '../common/ErrorBoundary';
import './AdminDashboard.css';

// Atomic component for admin card
const AdminCard = ({ title, count, icon, link, color, loading = false }) => (
  <Link to={link} className="stat-card" style={{ borderColor: color }}>
    <div className="stat-icon" style={{ backgroundColor: color }}>
      {icon}
    </div>
    <div className="stat-content">
      <h3>{title}</h3>
      <div className="stat-count">
        {loading ? (
          <LoadingSpinner size="small" type="dots" message="" />
        ) : (
          count.toLocaleString()
        )}
      </div>
    </div>
  </Link>
);

// Atomic component for quick action button
const QuickActionButton = ({ text, onClick, disabled = false }) => (
  <button 
    onClick={onClick} 
    className="action-btn"
    disabled={disabled}
  >
    {text}
  </button>
);

// Main AdminDashboard component
const AdminDashboard = () => {
  const { data: stats, loading, error, retry } = useApi(adminAPI.getStats);

  const adminCards = [
    {
      title: 'Users',
      count: stats?.users || 0,
      icon: '👥',
      link: '/admin/users',
      color: '#4CAF50'
    },
    {
      title: 'Devices',
      count: stats?.devices || 0,
      icon: '📱',
      link: '/admin/devices',
      color: '#2196F3'
    },
    {
      title: 'Notifications',
      count: stats?.notifications || 0,
      icon: '🔔',
      link: '/admin/notifications',
      color: '#FF9800'
    },
    {
      title: 'Emails',
      count: stats?.emails || 0,
      icon: '📧',
      link: '/admin/emails',
      color: '#9C27B0'
    },
    {
      title: 'SMS Messages',
      count: stats?.sms || 0,
      icon: '💬',
      link: '/admin/sms',
      color: '#00BCD4'
    },
    {
      title: 'Call Logs',
      count: stats?.callLogs || 0,
      icon: '📞',
      link: '/admin/call-logs',
      color: '#795548'
    },
    {
      title: 'Contacts',
      count: stats?.contacts || 0,
      icon: '👤',
      link: '/admin/contacts',
      color: '#607D8B'
    },
    {
      title: 'Gmail Accounts',
      count: stats?.gmailAccounts || 0,
      icon: '📮',
      link: '/admin/gmail-accounts',
      color: '#E91E63'
    }
  ];

  const handleQuickAction = (path) => {
    window.open(path, '_blank');
  };

  // Error state
  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>Failed to load dashboard</h2>
          <p>{error.message}</p>
          <button onClick={retry} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="admin-dashboard">
        <LoadingSpinner 
          size="large" 
          type="spinner" 
          message="Loading admin dashboard..." 
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="admin-dashboard">
        <NetworkStatus />
        
        <div className="admin-header">
          <h1>🔐 Admin Dashboard</h1>
          <p>Monitor and manage all collected data</p>
        </div>

        <div className="stats-grid">
          {adminCards.map((card, index) => (
            <AdminCard
              key={index}
              {...card}
              loading={loading}
            />
          ))}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <QuickActionButton
              text="View All Users"
              onClick={() => handleQuickAction('/admin/users')}
            />
            <QuickActionButton
              text="View All Devices"
              onClick={() => handleQuickAction('/admin/devices')}
            />
            <QuickActionButton
              text="View All Notifications"
              onClick={() => handleQuickAction('/admin/notifications')}
            />
            <QuickActionButton
              text="View All Emails"
              onClick={() => handleQuickAction('/admin/emails')}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdminDashboard; 