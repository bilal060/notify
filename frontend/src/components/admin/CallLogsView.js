import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './AdminViews.css';

const CallLogsView = () => {
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCall, setSelectedCall] = useState(null);

  useEffect(() => {
    fetchCallLogs();
  }, [currentPage, filterType]);

  const fetchCallLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/callLogs?page=${currentPage}&type=${filterType}`);
      if (response.ok) {
        const data = await response.json();
        setCallLogs(data.callLogs || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error('Failed to fetch call logs');
      }
    } catch (error) {
      console.error('Error fetching call logs:', error);
      toast.error('Error loading call logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredCallLogs = callLogs.filter(call =>
    call.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (call.name && call.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    call.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const getTypeBadge = (type) => {
    const typeColors = {
      incoming: '#28a745',
      outgoing: '#007bff',
      missed: '#ffc107',
      rejected: '#dc3545',
      blocked: '#6c757d',
      unknown: '#6c757d'
    };
    
    const typeIcons = {
      incoming: '📥',
      outgoing: '📤',
      missed: '📞❌',
      rejected: '📞🚫',
      blocked: '📞🚫',
      unknown: '📞❓'
    };
    
    return (
      <span 
        className="type-badge"
        style={{ backgroundColor: typeColors[type] || '#6c757d' }}
      >
        {typeIcons[type] || '📞'} {type}
      </span>
    );
  };

  const viewCallDetails = (call) => {
    setSelectedCall(call);
  };

  const closeModal = () => {
    setSelectedCall(null);
  };

  if (loading) {
    return <div className="loading">Loading call logs...</div>;
  }

  return (
    <div className="admin-view">
      <div className="view-header">
        <h1>📞 Call Logs Management</h1>
        <p>Monitor all collected call logs from devices</p>
      </div>

      <div className="controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search call logs..."
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
            <option value="incoming">Incoming</option>
            <option value="outgoing">Outgoing</option>
            <option value="missed">Missed</option>
            <option value="rejected">Rejected</option>
            <option value="blocked">Blocked</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <button onClick={fetchCallLogs} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">Total Calls:</span>
          <span className="stat-value">{callLogs.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Incoming:</span>
          <span className="stat-value">{callLogs.filter(c => c.type === 'incoming').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Outgoing:</span>
          <span className="stat-value">{callLogs.filter(c => c.type === 'outgoing').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Missed:</span>
          <span className="stat-value">{callLogs.filter(c => c.type === 'missed').length}</span>
        </div>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Device ID</th>
              <th>Number</th>
              <th>Name</th>
              <th>Type</th>
              <th>Duration</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCallLogs.map((call) => (
              <tr key={call._id}>
                <td>
                  <div className="device-id">
                    <span className="id-text">{call.deviceId}</span>
                  </div>
                </td>
                <td>
                  <div className="call-number">
                    {call.number}
                  </div>
                </td>
                <td>
                  <div className="call-name">
                    {call.name || 'Unknown'}
                  </div>
                </td>
                <td>{getTypeBadge(call.type)}</td>
                <td>
                  <div className="call-duration">
                    {formatDuration(call.duration)}
                  </div>
                </td>
                <td>{formatDate(call.date)}</td>
                <td>
                  <button
                    onClick={() => viewCallDetails(call)}
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

      {/* Call Details Modal */}
      {selectedCall && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Call Details</h2>
              <button onClick={closeModal} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Device ID:</label>
                    <span>{selectedCall.deviceId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone Number:</label>
                    <span>{selectedCall.number}</span>
                  </div>
                  <div className="detail-item">
                    <label>Contact Name:</label>
                    <span>{selectedCall.name || 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Call Type:</label>
                    <span>{getTypeBadge(selectedCall.type)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Duration:</label>
                    <span>{formatDuration(selectedCall.duration)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Timestamps</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Call Date:</label>
                    <span>{formatDate(selectedCall.date)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Timestamp:</label>
                    <span>{formatDate(selectedCall.timestamp)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Created:</label>
                    <span>{formatDate(selectedCall.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Updated:</label>
                    <span>{formatDate(selectedCall.updatedAt)}</span>
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

export default CallLogsView; 