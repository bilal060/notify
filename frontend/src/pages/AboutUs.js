import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const AboutUs = () => {
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

      {/* About Hero Section */}
      <section className="hero" style={{ height: '60vh', backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")' }}>
        <div className="hero-content">
          <h1>About Dubai Tourism</h1>
          <p>Your trusted partner in creating unforgettable Dubai experiences</p>
        </div>
      </section>

      {/* About Content */}
      <section className="features" style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '40px' }}>Our Story</h2>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.8', marginBottom: '40px', color: '#666' }}>
              Dubai Tourism was founded with a simple mission: to showcase the extraordinary beauty and experiences that Dubai has to offer to visitors from around the world. We believe that Dubai is not just a destination, but a journey into the future of luxury, innovation, and cultural richness.
            </p>
            
            <div className="features-grid" style={{ marginTop: '60px' }}>
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h3>Our Mission</h3>
                <p>To provide exceptional travel experiences that showcase Dubai's unique blend of tradition and modernity, ensuring every visitor discovers the magic of this extraordinary city.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👁️</div>
                <h3>Our Vision</h3>
                <p>To be the leading tourism platform that connects travelers with authentic Dubai experiences, making luxury and adventure accessible to everyone.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💎</div>
                <h3>Our Values</h3>
                <p>Excellence, authenticity, innovation, and customer satisfaction are the cornerstones of everything we do.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="attractions" style={{ padding: '80px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '60px' }}>Why Choose Us?</h2>
          <div className="attractions-grid">
            <div className="attraction-card">
              <div className="attraction-content">
                <h3>Expert Local Knowledge</h3>
                <p>Our team consists of Dubai natives and long-term residents who know every corner of the city and can provide insider tips and recommendations.</p>
              </div>
            </div>
            <div className="attraction-card">
              <div className="attraction-content">
                <h3>Personalized Service</h3>
                <p>We believe every traveler is unique. That's why we create customized itineraries tailored to your interests, budget, and travel style.</p>
              </div>
            </div>
            <div className="attraction-card">
              <div className="attraction-content">
                <h3>24/7 Support</h3>
                <p>From the moment you book until you return home, our dedicated support team is available around the clock to assist you.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Experience Dubai with Us?</h2>
          <p>Join thousands of satisfied travelers who have discovered the magic of Dubai through our services</p>
          <Link to="/book" className="cta-button">Start Planning Your Trip</Link>
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

export default AboutUs; 