import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../../services/apiService';
import './Dashboard.css';

const Media = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getMedia(currentPage);
      setMedia(data.media || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast.error('Error loading media');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchMedia();
    fetchStats();
  }, [fetchMedia]);

  const fetchStats = async () => {
    try {
      const data = await apiService.request('/api/media/stats');
      
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading media...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <Link to="/" className="back-button">← Back to Dashboard</Link>
        <h1>📸 All Media</h1>
        <p>Media files from all connected devices</p>
      </header>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📸</div>
          <div className="stat-content">
            <h3>{stats.totalMedia || 0}</h3>
            <p>Total Media</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🖼️</div>
          <div className="stat-content">
            <h3>{stats.images || 0}</h3>
            <p>Images</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎥</div>
          <div className="stat-content">
            <h3>{stats.videos || 0}</h3>
            <p>Videos</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">💾</div>
          <div className="stat-content">
            <h3>{formatFileSize(stats.totalSize || 0)}</h3>
            <p>Total Size</p>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      <div className="media-section">
        <h2>📸 Media Files</h2>
        
        {media.length === 0 ? (
          <div className="no-data">
            <p>No media files yet</p>
            <p>Install the mobile app to start collecting media</p>
          </div>
        ) : (
          <>
            <div className="media-grid">
              {media.map(mediaItem => (
                <div key={mediaItem._id} className="media-item">
                  {mediaItem.type === 'image' ? (
                    <img 
                      src={`/uploads/${mediaItem.filename}`} 
                      alt={mediaItem.originalName}
                      className="media-preview"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : (
                    <div className="media-preview video">
                      <span>🎥</span>
                    </div>
                  )}
                  
                  {/* Fallback for broken images */}
                  <div className="media-preview fallback" style={{ display: 'none' }}>
                    <span>🖼️</span>
                  </div>
                  
                  <div className="media-info">
                    <p className="media-name">{mediaItem.originalName}</p>
                    <p className="media-meta">
                      {mediaItem.type} • {formatFileSize(mediaItem.size)} • {formatDate(mediaItem.uploadDate)}
                    </p>
                    <p className="device-info">Device: {mediaItem.user}</p>
                  </div>
                  
                  <div className="media-actions">
                    <Link to={`/user/${mediaItem.user}`} className="action-button">
                      View Device
                    </Link>
                    <a 
                      href={`/uploads/${mediaItem.filename}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="action-button"
                    >
                      Download
                    </a>
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

export default Media; 