import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './AdminViews.css';

const DevicesView = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    fetchDevices();
  }, [currentPage, filterStatus]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/devices?page=${currentPage}&status=${filterStatus}`);
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error('Failed to fetch devices');
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      toast.error('Error loading devices');
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = devices.filter(device =>
    device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (device.deviceInfo?.manufacturer && device.deviceInfo.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (device.deviceInfo?.model && device.deviceInfo.model.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const viewDeviceDetails = (device) => {
    setSelectedDevice(device);
  };

  const closeModal = () => {
    setSelectedDevice(null);
  };

  if (loading) {
    return <div className="loading">Loading devices...</div>;
  }

  return (
    <div className="admin-view">
      <div className="view-header">
        <h1>📱 Devices Management</h1>
        <p>Monitor all registered devices and their information</p>
      </div>

      <div className="controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Devices</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
        <button onClick={fetchDevices} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">Total Devices:</span>
          <span className="stat-value">{devices.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Active Devices:</span>
          <span className="stat-value">{devices.filter(d => d.isActive).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Inactive Devices:</span>
          <span className="stat-value">{devices.filter(d => !d.isActive).length}</span>
        </div>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Device ID</th>
              <th>Manufacturer</th>
              <th>Model</th>
              <th>Android Version</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device) => (
              <tr key={device._id}>
                <td>
                  <div className="device-id">
                    <span className="id-text">{device.deviceId}</span>
                  </div>
                </td>
                <td>{device.deviceInfo?.manufacturer || 'N/A'}</td>
                <td>{device.deviceInfo?.model || 'N/A'}</td>
                <td>{device.deviceInfo?.androidVersion || 'N/A'}</td>
                <td>{getStatusBadge(device.isActive)}</td>
                <td>{formatDate(device.deviceInfo?.lastUpdated || device.updatedAt)}</td>
                <td>
                  <button
                    onClick={() => viewDeviceDetails(device)}
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

      {/* Device Details Modal */}
      {selectedDevice && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Device Details</h2>
              <button onClick={closeModal} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Device ID:</label>
                    <span>{selectedDevice.deviceId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status:</label>
                    <span>{getStatusBadge(selectedDevice.isActive)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Created:</label>
                    <span>{formatDate(selectedDevice.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Updated:</label>
                    <span>{formatDate(selectedDevice.updatedAt)}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Device Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Manufacturer:</label>
                    <span>{selectedDevice.deviceInfo?.manufacturer || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Model:</label>
                    <span>{selectedDevice.deviceInfo?.model || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Android Version:</label>
                    <span>{selectedDevice.deviceInfo?.androidVersion || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>SDK Version:</label>
                    <span>{selectedDevice.deviceInfo?.sdkVersion || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {selectedDevice.installedApps && selectedDevice.installedApps.length > 0 && (
                <div className="detail-section">
                  <h3>Installed Apps ({selectedDevice.installedApps.length})</h3>
                  <div className="apps-list">
                    {selectedDevice.installedApps.slice(0, 10).map((app, index) => (
                      <div key={index} className="app-item">
                        <div className="app-name">{app.appName}</div>
                        <div className="app-package">{app.packageName}</div>
                        <div className="app-version">v{app.versionName}</div>
                      </div>
                    ))}
                    {selectedDevice.installedApps.length > 10 && (
                      <div className="more-apps">
                        ... and {selectedDevice.installedApps.length - 10} more apps
                      </div>
                    )}
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

export default DevicesView; 