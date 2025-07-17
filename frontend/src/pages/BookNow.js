import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const BookNow = () => {
  const [selectedPackage, setSelectedPackage] = useState('');
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    guests: 1,
    checkIn: '',
    checkOut: '',
    specialRequests: ''
  });

  const handleChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Booking submitted:', { ...bookingData, package: selectedPackage });
    alert('Thank you for your booking request! We will confirm your reservation within 24 hours.');
    setBookingData({
      name: '',
      email: '',
      phone: '',
      guests: 1,
      checkIn: '',
      checkOut: '',
      specialRequests: ''
    });
    setSelectedPackage('');
  };

  const packages = [
    {
      id: 'luxury',
      name: 'Luxury Dubai Experience',
      price: 'AED 5,999',
      duration: '5 Days / 4 Nights',
      features: [
        '5-star hotel accommodation',
        'Private city tour with guide',
        'Burj Khalifa observation deck',
        'Desert safari with dinner',
        'Shopping tour with personal shopper',
        'Airport transfers',
        'Daily breakfast'
      ],
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 'adventure',
      name: 'Adventure Dubai Package',
      price: 'AED 3,999',
      duration: '4 Days / 3 Nights',
      features: [
        '4-star hotel accommodation',
        'Desert adventure activities',
        'Dubai Frame visit',
        'Dubai Mall & Aquarium',
        'Dhow cruise dinner',
        'Airport transfers',
        'Daily breakfast'
      ],
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 'cultural',
      name: 'Cultural Dubai Discovery',
      price: 'AED 2,999',
      duration: '3 Days / 2 Nights',
      features: [
        '3-star hotel accommodation',
        'Old Dubai walking tour',
        'Dubai Museum visit',
        'Traditional souk experience',
        'Abra boat ride',
        'Airport transfers',
        'Daily breakfast'
      ],
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    }
  ];

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

      {/* Booking Hero Section */}
      <section className="hero" style={{ height: '50vh', backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")' }}>
        <div className="hero-content">
          <h1>Book Your Dubai Adventure</h1>
          <p>Choose from our carefully curated packages and start planning your dream vacation</p>
        </div>
      </section>

      {/* Package Selection */}
      <section className="features" style={{ padding: '80px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '60px' }}>Choose Your Package</h2>
          <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
            {packages.map((pkg) => (
              <div 
                key={pkg.id}
                className="feature-card"
                style={{
                  cursor: 'pointer',
                  border: selectedPackage === pkg.id ? '3px solid #3b82f6' : '1px solid #e2e8f0',
                  transform: selectedPackage === pkg.id ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                <div style={{
                  height: '200px',
                  backgroundImage: `url(${pkg.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: '10px',
                  marginBottom: '20px'
                }}></div>
                <h3 style={{ color: '#1e3a8a', marginBottom: '10px' }}>{pkg.name}</h3>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '10px' }}>
                  {pkg.price}
                </div>
                <div style={{ color: '#666', marginBottom: '20px' }}>{pkg.duration}</div>
                <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
                  {pkg.features.map((feature, index) => (
                    <li key={index} style={{ marginBottom: '8px', color: '#666' }}>{feature}</li>
                  ))}
                </ul>
                {selectedPackage === pkg.id && (
                  <div style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginTop: '15px',
                    display: 'inline-block'
                  }}>
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="attractions" style={{ padding: '80px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '60px' }}>Complete Your Booking</h2>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label htmlFor="name" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={bookingData.name}
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
                    value={bookingData.email}
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
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label htmlFor="phone" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={bookingData.phone}
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
                  <label htmlFor="guests" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Number of Guests *
                  </label>
                  <select
                    id="guests"
                    name="guests"
                    value={bookingData.guests}
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
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label htmlFor="checkIn" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Check-in Date *
                  </label>
                  <input
                    type="date"
                    id="checkIn"
                    name="checkIn"
                    value={bookingData.checkIn}
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
                  <label htmlFor="checkOut" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                    Check-out Date *
                  </label>
                  <input
                    type="date"
                    id="checkOut"
                    name="checkOut"
                    value={bookingData.checkOut}
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
              </div>

              <div>
                <label htmlFor="specialRequests" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                  Special Requests
                </label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={bookingData.specialRequests}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Any special requirements or preferences..."
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

              {selectedPackage && (
                <div style={{
                  background: '#f0f9ff',
                  padding: '20px',
                  borderRadius: '10px',
                  border: '2px solid #3b82f6'
                }}>
                  <h4 style={{ color: '#1e3a8a', marginBottom: '10px' }}>Selected Package:</h4>
                  <p style={{ color: '#666', margin: 0 }}>
                    {packages.find(p => p.id === selectedPackage)?.name} - {packages.find(p => p.id === selectedPackage)?.price}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedPackage}
                style={{
                  background: selectedPackage ? 'linear-gradient(135deg, #1e3a8a, #3b82f6)' : '#cbd5e1',
                  color: 'white',
                  padding: '15px 30px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: selectedPackage ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  marginTop: '20px'
                }}
                onMouseOver={(e) => selectedPackage && (e.target.style.transform = 'translateY(-2px)')}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                {selectedPackage ? 'Confirm Booking' : 'Please Select a Package'}
              </button>
            </form>
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

export default BookNow; 