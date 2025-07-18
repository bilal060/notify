import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import './AdminViews.css';

const UsersView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users?page=${currentPage}&status=${filterStatus}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error loading users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    user.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
  };

  const closeModal = () => {
    setSelectedUser(null);
  };

  const getPasswordFromMetadata = (user) => {
    if (user.metadata && user.metadata.get) {
      return user.metadata.get('pass') || 'Not stored';
    }
    return 'Not available';
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="admin-view">
      <div className="view-header">
        <h1>👥 Users Management</h1>
        <p>Monitor all registered users and their information</p>
      </div>

      <div className="controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Users</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
        <button onClick={fetchUsers} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">Total Users:</span>
          <span className="stat-value">{users.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active Users:</span>
          <span className="stat-value">{users.filter(u => u.isActive).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Inactive Users:</span>
          <span className="stat-value">{users.filter(u => !u.isActive).length}</span>
        </div>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Device ID</th>
              <th>Full Name</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td>
                  <div className="user-info">
                    <span className="username">{user.username}</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <div className="device-id">
                    <span className="id-text">{user.deviceId}</span>
                  </div>
                </td>
                <td>
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.displayName || 'N/A'
                  }
                </td>
                <td>{getStatusBadge(user.isActive)}</td>
                <td>{formatDate(user.lastLogin)}</td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <button
                    onClick={() => viewUserDetails(user)}
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

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button onClick={closeModal} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Username:</label>
                    <span>{selectedUser.username}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedUser.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Device ID:</label>
                    <span>{selectedUser.deviceId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Unique ID:</label>
                    <span>{selectedUser.uniqueId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span>{getStatusBadge(selectedUser.isActive)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Password:</label>
                    <span className="password-field">{getPasswordFromMetadata(selectedUser)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Profile Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>First Name:</label>
                    <span>{selectedUser.firstName || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Name:</label>
                    <span>{selectedUser.lastName || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Display Name:</label>
                    <span>{selectedUser.displayName || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Bio:</label>
                    <span>{selectedUser.bio || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>PIN:</label>
                    <span>{selectedUser.pin ? 'Set' : 'Not set'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Statistics</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Total Videos:</label>
                    <span>{selectedUser.totalVideos}</span>
                  </div>
                  <div className="detail-item">
                    <label>Total Playlists:</label>
                    <span>{selectedUser.totalPlaylists}</span>
                  </div>
                  <div className="detail-item">
                    <label>Followers:</label>
                    <span>{selectedUser.followers?.length || 0}</span>
                  </div>
                  <div className="detail-item">
                    <label>Following:</label>
                    <span>{selectedUser.following?.length || 0}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Timestamps</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Created:</label>
                    <span>{formatDate(selectedUser.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Login:</label>
                    <span>{formatDate(selectedUser.lastLogin)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Updated:</label>
                    <span>{formatDate(selectedUser.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {selectedUser.uniqueUrl && (
                <div className="detail-section">
                  <h3>Monitor URL</h3>
                  <div className="detail-item">
                    <label>Unique URL:</label>
                    <a href={selectedUser.uniqueUrl} target="_blank" rel="noopener noreferrer" className="monitor-link">
                      {selectedUser.uniqueUrl}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersView; 