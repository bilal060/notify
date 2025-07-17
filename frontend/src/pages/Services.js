import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const Services = () => {
  const [activeService, setActiveService] = useState('flight');

  const services = [
    {
      id: 'flight',
      name: 'Flight Booking',
      icon: '✈️',
      description: 'Comprehensive flight booking services to and from Dubai',
      features: [
        'Best deals with major airlines worldwide',
        'Flexible booking options',
        '24/7 customer support',
        'Multi-city itineraries',
        'Business and economy class options',
        'Special group booking rates'
      ],
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80'
    },
    {
      id: 'hotel',
      name: 'Hotel Booking',
      icon: '🏨',
      description: 'Luxury hotels, resorts, and boutique accommodations across Dubai',
      features: [
        '5-star luxury hotels and resorts',
        'Boutique and heritage hotels',
        'All-inclusive packages',
        'Beachfront properties',
        'City center accommodations',
        'Special honeymoon packages'
      ],
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 'honeymoon',
      name: 'Honeymoon Packages',
      icon: '💕',
      description: 'Romantic getaways and special honeymoon experiences in Dubai',
      features: [
        'Luxury honeymoon suites',
        'Private beach access',
        'Romantic dinner arrangements',
        'Couple spa treatments',
        'Sunset desert experiences',
        'Personal honeymoon planner'
      ],
      image: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 'solo',
      name: 'Solo Trip',
      icon: '👤',
      description: 'Adventure packages designed specifically for solo travelers',
      features: [
        'Solo-friendly accommodations',
        'Group activities for solo travelers',
        'Safety-focused itineraries',
        'Local guide assistance',
        'Social meetup opportunities',
        'Flexible solo travel packages'
      ],
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 'group',
      name: 'Group Tours',
      icon: '👥',
      description: 'Exciting group tours with friends, family, or corporate teams',
      features: [
        'Family group packages',
        'Corporate team building tours',
        'Friends reunion packages',
        'Educational group tours',
        'Group discounts available',
        'Dedicated group coordinator'
      ],
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80'
    },
    {
      id: 'custom',
      name: 'Custom Tours',
      icon: '🎨',
      description: 'Personalized tours tailored to your specific interests and schedule',
      features: [
        'Completely personalized itineraries',
        'Flexible scheduling options',
        'Special interest focus (shopping, food, culture)',
        'Private guide services',
        'Custom accommodation preferences',
        'Tailored transportation options'
      ],
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 'entertainment',
      name: 'Entertainment & Attractions',
      icon: '🎭',
      description: 'Comprehensive entertainment planning for all Dubai attractions',
      features: [
        'Burj Khalifa & Dubai Mall tickets',
        'Theme parks & water parks access',
        'Dubai Opera & cultural shows',
        'Desert safari & adventure activities',
        'Dhow cruise & marina experiences',
        'VIP access to exclusive venues'
      ],
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 'desert',
      name: 'Desert Safari',
      icon: '🐪',
      description: 'Thrilling desert adventures with traditional Bedouin experiences',
      features: [
        'Dune bashing and sandboarding',
        'Traditional Bedouin camp experience',
        'Sunset and sunrise safaris',
        'Camel riding and falconry',
        'BBQ dinner under the stars',
        'Private and group safari options'
      ],
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 'planning',
      name: 'Trip Planning',
      icon: '🗺️',
      description: 'Customized itineraries tailored to your interests and preferences',
      features: [
        'Personalized travel itineraries',
        'Multi-day tour packages',
        'Family-friendly planning',
        'Luxury travel experiences',
        'Budget-conscious options',
        'Special interest tours (shopping, food, culture)'
      ],
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 'cruise',
      name: 'Cruise Trip Booking',
      icon: '🚢',
      description: 'Luxury cruise experiences around the Arabian Gulf',
      features: [
        'Arabian Gulf cruise packages',
        'Luxury cruise ship bookings',
        'Island hopping experiences',
        'Dinner cruise options',
        'Private yacht charters',
        'Multi-day cruise packages'
      ],
      image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 'transport',
      name: 'Pick & Drop',
      icon: '🚗',
      description: 'Reliable airport transfers and city transportation services',
      features: [
        'Airport pickup and drop-off',
        'Luxury vehicle options',
        '24/7 transportation service',
        'City tour transportation',
        'Group transfer services',
        'VIP limousine service'
      ],
      image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    {
      id: 'vip',
      name: 'VIP Services',
      icon: '🎯',
      description: 'Premium concierge services for the ultimate luxury experience',
      features: [
        'Personal concierge service',
        'VIP airport assistance',
        'Exclusive venue access',
        'Private dining experiences',
        'Luxury shopping assistance',
        'Celebrity-style treatment'
      ],
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    }
  ];

  const selectedService = services.find(service => service.id === activeService);

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

      {/* Services Hero Section */}
      <section className="hero" style={{ height: '50vh', backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")' }}>
        <div className="hero-content">
          <h1>Our Premium Services</h1>
          <p>Comprehensive travel solutions for your perfect Dubai experience</p>
        </div>
      </section>

      {/* Services Navigation */}
      <section className="services-nav" style={{ padding: '40px 0', background: '#f8fafc' }}>
        <div className="container">
          <div className="services-nav-grid">
            {services.map((service) => (
              <button
                key={service.id}
                className={`service-nav-btn ${activeService === service.id ? 'active' : ''}`}
                onClick={() => setActiveService(service.id)}
              >
                <span className="service-nav-icon">{service.icon}</span>
                <span className="service-nav-name">{service.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="service-details" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="service-details-grid">
            <div className="service-details-content">
              <div className="service-header">
                <span className="service-icon-large">{selectedService.icon}</span>
                <h2>{selectedService.name}</h2>
              </div>
              <p className="service-description">{selectedService.description}</p>
              
              <div className="service-features">
                <h3>What's Included:</h3>
                <ul>
                  {selectedService.features.map((feature, index) => (
                    <li key={index}>
                      <span className="feature-check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="service-cta">
                <Link to="/book" className="cta-button">Book This Service</Link>
                <Link to="/contact" className="secondary-button">Get Quote</Link>
              </div>
            </div>
            
            <div className="service-details-image">
              <img src={selectedService.image} alt={selectedService.name} />
            </div>
          </div>
        </div>
      </section>

      {/* All Services Overview */}
      <section className="services-overview" style={{ padding: '80px 0', background: '#f8fafc' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '60px' }}>All Our Services</h2>
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <button
                  className="service-link"
                  onClick={() => setActiveService(service.id)}
                >
                  Learn More →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="why-choose" style={{ padding: '80px 0' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '60px' }}>Why Choose Our Services?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🌟</div>
              <h3>Premium Quality</h3>
              <p>We partner with the best hotels, airlines, and service providers to ensure exceptional quality.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Best Prices</h3>
              <p>Get the best deals and competitive prices with our extensive network of partners.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Safe & Secure</h3>
              <p>Your safety and security are our top priorities with comprehensive travel protection.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Personalized Service</h3>
              <p>Every service is tailored to your specific needs and preferences.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Experience Dubai?</h2>
          <p>Contact us today to start planning your dream vacation</p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/book" className="cta-button">Book Now</Link>
            <Link to="/contact" className="cta-button" style={{ background: 'white', color: '#1e3a8a' }}>Contact Us</Link>
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
              <Link to="/services">Services</Link>
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

export default Services; 