import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Dashboard.css';

const UserDetail = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
      } else {
        toast.error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Error loading user data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

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
        <div className="loading">Loading user data...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="dashboard-container">
        <div className="error">User not found</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <Link to="/" className="back-button">← Back to Dashboard</Link>
        <h1>📱 Device Details</h1>
        <p>Device ID: {userData.user.uniqueId}</p>
      </header>

      {/* Device Info */}
      <div className="device-info-section">
        <h2>📱 Device Information</h2>
        <div className="device-card">
          <div className="device-header">
            <div className="device-avatar">📱</div>
            <div className="device-info">
              <h3>{getDeviceInfo(userData.user.deviceInfo)}</h3>
              <p>Device ID: {userData.user.uniqueId}</p>
            </div>
          </div>
          
          <div className="device-details">
            {userData.user.deviceInfo && (
              <>
                <div className="detail-item">
                  <span className="label">Manufacturer:</span>
                  <span className="value">{userData.user.deviceInfo.manufacturer || 'Unknown'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Model:</span>
                  <span className="value">{userData.user.deviceInfo.model || 'Unknown'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Android Version:</span>
                  <span className="value">{userData.user.deviceInfo.androidVersion || 'Unknown'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">SDK Version:</span>
                  <span className="value">{userData.user.deviceInfo.sdkVersion || 'Unknown'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Device ID:</span>
                  <span className="value">{userData.user.deviceInfo.deviceId || 'Unknown'}</span>
                </div>
              </>
            )}
            <div className="detail-item">
              <span className="label">Connected:</span>
              <span className="value">{formatDate(userData.user.createdAt)}</span>
            </div>
            {userData.user.lastLogin && (
              <div className="detail-item">
                <span className="label">Last Active:</span>
                <span className="value">{formatDate(userData.user.lastLogin)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <h3>{userData.stats.notifications}</h3>
            <p>Notifications</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📸</div>
          <div className="stat-content">
            <h3>{userData.stats.media?.total || 0}</h3>
            <p>Media Files</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-content">
            <h3>{userData.stats.apps}</h3>
            <p>Installed Apps</p>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="notifications-section">
        <h2>🔔 Recent Notifications</h2>
        {userData.recentNotifications.length === 0 ? (
          <div className="no-data">
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="notifications-list">
            {userData.recentNotifications.map(notification => (
              <div key={notification._id} className="notification-item">
                <div className="notification-content">
                  <h4>{notification.title}</h4>
                  <p>{notification.body}</p>
                  <div className="notification-meta">
                    <span className="app-name">{notification.appName}</span>
                    <span className="timestamp">
                      {formatDate(notification.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Media */}
      <div className="media-section">
        <h2>📸 Recent Media</h2>
        {userData.recentMedia.length === 0 ? (
          <div className="no-data">
            <p>No media files yet</p>
          </div>
        ) : (
          <div className="media-grid">
            {userData.recentMedia.map(media => (
              <div key={media._id} className="media-item">
                {media.type === 'image' ? (
                  <img 
                    src={`/uploads/${media.filename}`} 
                    alt={media.originalName}
                    className="media-preview"
                  />
                ) : (
                  <div className="media-preview video">
                    <span>🎥</span>
                  </div>
                )}
                <div className="media-info">
                  <p className="media-name">{media.originalName}</p>
                  <p className="media-meta">
                    {media.type} • {formatDate(media.uploadDate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Installed Apps */}
      <div className="apps-section">
        <h2>📱 Installed Apps ({userData.user.installedApps?.length || 0})</h2>
        {!userData.user.installedApps || userData.user.installedApps.length === 0 ? (
          <div className="no-data">
            <p>No apps data available</p>
          </div>
        ) : (
          <div className="apps-grid">
            {userData.user.installedApps.slice(0, 20).map((app, index) => (
              <div key={index} className="app-item">
                <div className="app-icon">📱</div>
                <div className="app-info">
                  <p className="app-name">{app.appName || 'Unknown App'}</p>
                  <p className="app-package">{app.packageName || 'Unknown Package'}</p>
                </div>
              </div>
            ))}
            {userData.user.installedApps.length > 20 && (
              <div className="more-apps">
                <p>... and {userData.user.installedApps.length - 20} more apps</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail; 