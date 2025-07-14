import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotifications: 0,
    totalMedia: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [notificationsRes, mediaRes] = await Promise.all([
        fetch('/api/notifications/stats'),
        fetch('/api/media/stats')
      ]);
      
      const notificationsData = await notificationsRes.json();
      const mediaData = await mediaRes.json();
      
      if (notificationsData.success && mediaData.success) {
        setStats({
          totalUsers: users.length,
          totalNotifications: notificationsData.data.totalNotifications,
          totalMedia: mediaData.data.totalMedia
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceInfo = (deviceInfo) => {
    if (!deviceInfo) return 'No device info';
    return `${deviceInfo.manufacturer || 'Unknown'} ${deviceInfo.model || 'Device'}`;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>📱 Mobile Data Collection Dashboard</h1>
        <p>Monitor collected data from mobile devices</p>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{users.length}</h3>
            <p>Active Devices</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <h3>{stats.totalNotifications}</h3>
            <p>Notifications</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📸</div>
          <div className="stat-content">
            <h3>{stats.totalMedia}</h3>
            <p>Media Files</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-content">
            <h3>{users.reduce((acc, user) => acc + (user.installedApps?.length || 0), 0)}</h3>
            <p>Installed Apps</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="nav-buttons">
        <Link to="/notifications" className="nav-button">
          🔔 View All Notifications
        </Link>
        <Link to="/media" className="nav-button">
          📸 View All Media
        </Link>
      </div>

      {/* Users Table */}
      <div className="users-section">
        <h2>📱 Connected Devices</h2>
        
        {users.length === 0 ? (
          <div className="no-data">
            <p>No devices connected yet</p>
            <p>Install the mobile app to start collecting data</p>
          </div>
        ) : (
          <div className="users-grid">
            {users.map((user) => (
              <div key={user.uniqueId} className="user-card">
                <div className="user-header">
                  <div className="user-avatar">📱</div>
                  <div className="user-info">
                    <h3>Device {user.uniqueId}</h3>
                    <p>{getDeviceInfo(user.deviceInfo)}</p>
                  </div>
                </div>
                
                <div className="user-details">
                  <div className="detail-item">
                    <span className="label">Device ID:</span>
                    <span className="value">{user.uniqueId}</span>
                  </div>
                  
                  {user.deviceInfo && (
                    <>
                      <div className="detail-item">
                        <span className="label">Android Version:</span>
                        <span className="value">{user.deviceInfo.androidVersion || 'Unknown'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">SDK Version:</span>
                        <span className="value">{user.deviceInfo.sdkVersion || 'Unknown'}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="detail-item">
                    <span className="label">Installed Apps:</span>
                    <span className="value">{user.installedApps?.length || 0}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label">Connected:</span>
                    <span className="value">{formatDate(user.createdAt)}</span>
                  </div>
                  
                  {user.lastLogin && (
                    <div className="detail-item">
                      <span className="label">Last Active:</span>
                      <span className="value">{formatDate(user.lastLogin)}</span>
                    </div>
                  )}
                </div>
                
                <div className="user-actions">
                  <Link to={`/user/${user.uniqueId}`} className="action-button">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 