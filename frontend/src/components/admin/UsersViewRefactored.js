import React, { useState } from 'react';
import { usePaginatedApi, useSearch } from '../../hooks/useApi';
import { adminAPI } from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState, { EmptyUsers } from '../common/EmptyState';
import NetworkStatus from '../common/NetworkStatus';
import ErrorBoundary from '../common/ErrorBoundary';
import './AdminViews.css';

// Atomic component for status badge
const StatusBadge = ({ isActive }) => (
  <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

// Atomic component for search input
const SearchInput = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="search-input"
  />
);

// Atomic component for filter select
const FilterSelect = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={onChange}
    className="filter-select"
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

// Atomic component for pagination
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="page-btn"
      >
        Previous
      </button>
      <span className="page-info">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="page-btn"
      >
        Next
      </button>
    </div>
  );
};

// Atomic component for user row
const UserRow = ({ user, onViewDetails, formatDate }) => (
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
    <td><StatusBadge isActive={user.isActive} /></td>
    <td>{formatDate(user.lastLogin)}</td>
    <td>{formatDate(user.createdAt)}</td>
    <td>
      <button
        onClick={() => onViewDetails(user)}
        className="view-btn"
      >
        👁️ View
      </button>
    </td>
  </tr>
);

// Main UsersView component
const UsersView = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Use custom hooks for API and search
  const {
    data: users,
    loading,
    error,
    pagination,
    changePage,
    changeFilters,
    refresh
  } = usePaginatedApi(adminAPI.getUsers, { status: filterStatus });

  const { filteredData: filteredUsers } = useSearch(users, [
    'username',
    'email',
    'firstName',
    'lastName',
    'deviceId'
  ]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleFilterChange = (newStatus) => {
    setFilterStatus(newStatus);
    changeFilters({ status: newStatus });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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

  const filterOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'active', label: 'Active Only' },
    { value: 'inactive', label: 'Inactive Only' }
  ];

  // Error state
  if (error) {
    return (
      <div className="admin-view">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h2>Failed to load users</h2>
          <p>{error.message}</p>
          <button onClick={refresh} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="admin-view">
        <NetworkStatus />
        
        <div className="view-header">
          <h1>👥 Users Management</h1>
          <p>Monitor all registered users and their information</p>
        </div>

        <div className="controls">
          <div className="search-filter">
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search users..."
            />
            <FilterSelect
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value)}
              options={filterOptions}
            />
          </div>
          <button onClick={refresh} className="refresh-btn" disabled={loading}>
            {loading ? <LoadingSpinner size="small" type="dots" message="" /> : '🔄 Refresh'}
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

        {loading ? (
          <div className="loading-container">
            <LoadingSpinner size="large" message="Loading users..." />
          </div>
        ) : users.length === 0 ? (
          <EmptyUsers onRefresh={refresh} />
        ) : (
          <>
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
                    <UserRow
                      key={user._id}
                      user={user}
                      onViewDetails={viewUserDetails}
                      formatDate={formatDate}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={changePage}
            />
          </>
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
                      <span><StatusBadge isActive={selectedUser.isActive} /></span>
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
    </ErrorBoundary>
  );
};

export default UsersView; 