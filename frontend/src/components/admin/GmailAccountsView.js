import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './AdminViews.css';

const GmailAccountsView = () => {
  const [gmailAccounts, setGmailAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    fetchGmailAccounts();
  }, [currentPage]);

  const fetchGmailAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gmail/accounts?page=${currentPage}`);
      if (response.ok) {
        const data = await response.json();
        setGmailAccounts(data.accounts || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error('Failed to fetch Gmail accounts');
      }
    } catch (error) {
      console.error('Error fetching Gmail accounts:', error);
      toast.error('Error loading Gmail accounts');
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = gmailAccounts.filter(account =>
    account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.name && account.name.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const viewAccountDetails = (account) => {
    setSelectedAccount(account);
  };

  const closeModal = () => {
    setSelectedAccount(null);
  };

  const deleteAccount = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this Gmail account?')) {
      try {
        const response = await fetch(`/api/gmail/accounts/${accountId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          toast.success('Gmail account deleted successfully');
          fetchGmailAccounts();
        } else {
          toast.error('Failed to delete Gmail account');
        }
      } catch (error) {
        console.error('Error deleting Gmail account:', error);
        toast.error('Error deleting Gmail account');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading Gmail accounts...</div>;
  }

  return (
    <div className="admin-view">
      <div className="view-header">
        <h1>📮 Gmail Accounts Management</h1>
        <p>Monitor all connected Gmail accounts and their status</p>
      </div>

      <div className="controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search Gmail accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={fetchGmailAccounts} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">Total Accounts:</span>
          <span className="stat-value">{gmailAccounts.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active:</span>
          <span className="stat-value">{gmailAccounts.filter(a => a.isActive).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Inactive:</span>
          <span className="stat-value">{gmailAccounts.filter(a => !a.isActive).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Unique Devices:</span>
          <span className="stat-value">{new Set(gmailAccounts.map(a => a.deviceId)).size}</span>
        </div>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Device ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Last Sync</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((account) => (
              <tr key={account._id}>
                <td>
                  <div className="gmail-email">
                    {account.email}
                  </div>
                </td>
                <td>
                  <div className="device-id">
                    <span className="id-text">{account.deviceId}</span>
                  </div>
                </td>
                <td>
                  <div className="gmail-name">
                    {account.name || 'N/A'}
                  </div>
                </td>
                <td>{getStatusBadge(account.isActive)}</td>
                <td>{formatDate(account.lastSync || account.updatedAt)}</td>
                <td>{formatDate(account.createdAt)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      onClick={() => viewAccountDetails(account)}
                      className="view-btn"
                    >
                      👁️ View
                    </button>
                    <button
                      onClick={() => deleteAccount(account._id)}
                      className="delete-btn"
                    >
                      🗑️ Delete
                    </button>
                  </div>
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

      {/* Gmail Account Details Modal */}
      {selectedAccount && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Gmail Account Details</h2>
              <button onClick={closeModal} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Account Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedAccount.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedAccount.name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Device ID:</label>
                    <span>{selectedAccount.deviceId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span>{getStatusBadge(selectedAccount.isActive)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Access Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Access Token:</label>
                    <span className="token-field">
                      {selectedAccount.accessToken ? 'Set' : 'Not set'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Refresh Token:</label>
                    <span className="token-field">
                      {selectedAccount.refreshToken ? 'Set' : 'Not set'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Token Expiry:</label>
                    <span>
                      {selectedAccount.tokenExpiry ? formatDate(selectedAccount.tokenExpiry) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Sync Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Last Sync:</label>
                    <span>{formatDate(selectedAccount.lastSync || 'Never')}</span>
                  </div>
                  <div className="detail-item">
                    <label>Sync Status:</label>
                    <span>{selectedAccount.syncStatus || 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Total Emails:</label>
                    <span>{selectedAccount.totalEmails || 0}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Timestamps</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Created:</label>
                    <span>{formatDate(selectedAccount.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Updated:</label>
                    <span>{formatDate(selectedAccount.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {selectedAccount.metadata && Object.keys(selectedAccount.metadata).length > 0 && (
                <div className="detail-section">
                  <h3>Additional Metadata</h3>
                  <div className="metadata-content">
                    <pre>{JSON.stringify(selectedAccount.metadata, null, 2)}</pre>
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

export default GmailAccountsView; 