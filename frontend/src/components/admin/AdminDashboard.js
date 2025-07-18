import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../../services/apiService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    devices: 0,
    notifications: 0,
    emails: 0,
    sms: 0,
    callLogs: 0,
    contacts: 0,
    gmailAccounts: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiService.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const adminCards = [
    {
      title: 'Users',
      count: stats.users,
      icon: '👥',
      link: '/admin/users',
      color: '#4CAF50'
    },
    {
      title: 'Devices',
      count: stats.devices,
      icon: '📱',
      link: '/admin/devices',
      color: '#2196F3'
    },
    {
      title: 'Notifications',
      count: stats.notifications,
      icon: '🔔',
      link: '/admin/notifications',
      color: '#FF9800'
    },
    {
      title: 'Emails',
      count: stats.emails,
      icon: '📧',
      link: '/admin/emails',
      color: '#9C27B0'
    },
    {
      title: 'SMS Messages',
      count: stats.sms,
      icon: '💬',
      link: '/admin/sms',
      color: '#00BCD4'
    },
    {
      title: 'Call Logs',
      count: stats.callLogs,
      icon: '📞',
      link: '/admin/call-logs',
      color: '#795548'
    },
    {
      title: 'Contacts',
      count: stats.contacts,
      icon: '👤',
      link: '/admin/contacts',
      color: '#607D8B'
    },
    {
      title: 'Gmail Accounts',
      count: stats.gmailAccounts,
      icon: '📮',
      link: '/admin/gmail-accounts',
      color: '#E91E63'
    }
  ];

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>🔐 Admin Dashboard</h1>
        <p>Monitor and manage all collected data</p>
      </div>

      <div className="stats-grid">
        {adminCards.map((card, index) => (
          <Link to={card.link} key={index} className="stat-card" style={{ borderColor: card.color }}>
            <div className="stat-icon" style={{ backgroundColor: card.color }}>
              {card.icon}
            </div>
            <div className="stat-content">
              <h3>{card.title}</h3>
              <div className="stat-count">{card.count.toLocaleString()}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button onClick={() => window.open('/admin/users', '_blank')} className="action-btn">
            View All Users
          </button>
          <button onClick={() => window.open('/admin/devices', '_blank')} className="action-btn">
            View All Devices
          </button>
          <button onClick={() => window.open('/admin/notifications', '_blank')} className="action-btn">
            View All Notifications
          </button>
          <button onClick={() => window.open('/admin/emails', '_blank')} className="action-btn">
            View All Emails
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 