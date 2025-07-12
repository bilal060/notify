import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout, hasActiveSubscription } = useAuth();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [userUrl, setUserUrl] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user) {
      fetchUserUrl();
      // Temporarily removed subscription check for testing
      fetchNotifications();
      fetchStats();
    }
  }, [user, currentPage]);

  const fetchUserUrl = async () => {
    try {
      const response = await axios.get('/api/notifications/url');
      setUserUrl(response.data.data.uniqueUrl);
    } catch (error) {
      console.error('Failed to fetch user URL:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`/api/notifications?page=${currentPage}&limit=10`);
      const { notifications, pagination } = response.data.data;
      setNotifications(notifications);
      setTotalPages(pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/notifications/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      fetchStats(); // Refresh stats
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      fetchStats(); // Refresh stats
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      fetchStats(); // Refresh stats
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const copyUrlToClipboard = () => {
    navigator.clipboard.writeText(userUrl);
    toast.success('URL copied to clipboard!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Temporarily removed subscription check for testing
  // if (!hasActiveSubscription()) {
  //   return (
  //     <div className="dashboard-container">
  //       <div className="subscription-required">
  //         <h2>Subscription Required</h2>
  //         <p>You need an active subscription to access notification monitoring.</p>
  //         <button 
  //           className="subscribe-button"
  //           onClick={() => navigate('/payment')}
  //         >
  //           Subscribe Now
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Notification Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.username}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Notifications</h3>
          <p className="stat-number">{stats.totalNotifications || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Unread</h3>
          <p className="stat-number">{stats.unreadCount || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Recent Activity</h3>
          <p className="stat-number">{stats.recentActivity || 0}</p>
        </div>
      </div>

      {/* Unique URL Section */}
      <div className="url-section">
        <h2>Your Monitoring URL</h2>
        <p>Share this URL on mobile devices to start monitoring notifications:</p>
        <div className="url-display">
          <input 
            type="text" 
            value={userUrl} 
            readOnly 
            className="url-input"
          />
          <button onClick={copyUrlToClipboard} className="copy-button">
            Copy
          </button>
        </div>
        <div className="url-instructions">
          <h4>Instructions:</h4>
          <ol>
            <li>Open this URL on the mobile device you want to monitor</li>
            <li>Grant notification permissions when prompted</li>
            <li>Notifications will automatically appear in your dashboard</li>
          </ol>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="notifications-section">
        <div className="notifications-header">
          <h2>Recent Notifications</h2>
          <div className="notifications-actions">
            <button onClick={markAllAsRead} className="action-button">
              Mark All Read
            </button>
            <button onClick={fetchNotifications} className="action-button">
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="no-notifications">
            <p>No notifications yet. Share your URL on a mobile device to start monitoring.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(notification => (
              <div 
                key={notification._id} 
                className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
              >
                <div className="notification-content">
                  <h4>{notification.title}</h4>
                  <p>{notification.body}</p>
                  <div className="notification-meta">
                    <span className="app-name">{notification.appName}</span>
                    <span className="timestamp">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="notification-actions">
                  {!notification.isRead && (
                    <button 
                      onClick={() => markAsRead(notification._id)}
                      className="mark-read-button"
                    >
                      Mark Read
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notification._id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

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
      </div>
    </div>
  );
};

export default Dashboard; 