import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>Dubai Tourism</h2>
          </div>
          
          <div className="nav-menu">
            <Link to="/about" className="nav-link">About Us</Link>
            <Link to="/services" className="nav-link">Services</Link>
            <Link to="/contact" className="nav-link">Contact Us</Link>
            <Link to="/book" className="nav-link book-now">Book Now</Link>
            <Link to="/login" className="nav-link login-btn">Login</Link>
          </div>
          
          <div className="nav-toggle">
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </div>
      </nav>

      {/* Contact Hero Section */}
      <section className="hero" style={{ height: '50vh', backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")' }}>
        <div className="hero-content">
          <h1>Contact Us</h1>
          <p>Get in touch with our team for personalized Dubai experiences</p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="features" style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'start' }}>
            {/* Contact Form */}
            <div>
              <h2 style={{ marginBottom: '30px', color: '#1e3a8a' }}>Send us a Message</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
                
                <div>
                  <label htmlFor="message" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    style={{
                      width: '100%',
                      padding: '12px 15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '16px',
                      resize: 'vertical',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  style={{
                    background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                    color: 'white',
                    padding: '15px 30px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 style={{ marginBottom: '30px', color: '#1e3a8a' }}>Get in Touch</h2>
              
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ color: '#1e3a8a', marginBottom: '15px' }}>📍 Office Address</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Dubai Tourism Center<br />
                  Sheikh Zayed Road<br />
                  Dubai, United Arab Emirates<br />
                  P.O. Box 12345
                </p>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ color: '#1e3a8a', marginBottom: '15px' }}>📞 Phone Numbers</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  General Inquiries: +971 4 123 4567<br />
                  Booking Support: +971 4 123 4568<br />
                  Emergency: +971 4 123 4569
                </p>
              </div>

              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ color: '#1e3a8a', marginBottom: '15px' }}>✉️ Email Addresses</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  General: info@dubaitourism.com<br />
                  Bookings: bookings@dubaitourism.com<br />
                  Support: support@dubaitourism.com
                </p>
              </div>

              <div>
                <h3 style={{ color: '#1e3a8a', marginBottom: '15px' }}>🕒 Business Hours</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Monday - Friday: 8:00 AM - 8:00 PM<br />
                  Saturday: 9:00 AM - 6:00 PM<br />
                  Sunday: 10:00 AM - 4:00 PM<br />
                  <strong>24/7 Emergency Support Available</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="attractions" style={{ padding: '80px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Find Us</h2>
          <div style={{ 
            background: '#f8fafc', 
            padding: '40px', 
            borderRadius: '15px', 
            textAlign: 'center',
            border: '2px dashed #cbd5e1'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🗺️</div>
            <h3 style={{ color: '#1e3a8a', marginBottom: '15px' }}>Interactive Map</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Our office is located in the heart of Dubai, easily accessible from all major areas.
            </p>
            <button
              style={{
                background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                color: 'white',
                padding: '12px 25px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              View on Google Maps
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Dubai Tourism</h3>
              <p>Your gateway to the extraordinary</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/book">Book Now</Link>
            </div>
            <div className="footer-section">
              <h4>Contact Info</h4>
              <p>Email: info@dubaitourism.com</p>
              <p>Phone: +971 4 123 4567</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Dubai Tourism. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs; 