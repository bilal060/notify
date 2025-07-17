import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Slider data
  const slides = [
    {
      id: 1,
      title: "Discover the Magic of Dubai",
      subtitle: "Experience luxury, adventure, and culture in the heart of the UAE",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      cta: "Start Your Journey"
    },
    {
      id: 2,
      title: "Luxury Redefined",
      subtitle: "From 7-star hotels to world-class shopping, experience the ultimate in luxury",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      cta: "Explore Luxury"
    },
    {
      id: 3,
      title: "Adventure Awaits",
      subtitle: "Desert safaris, water parks, and thrilling experiences for every adventurer",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      cta: "Book Adventure"
    }
  ];

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>Dubai Tourism</h2>
          </div>
          
          <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/about" className="nav-link">About Us</Link>
            <Link to="/services" className="nav-link">Services</Link>
            <Link to="/contact" className="nav-link">Contact Us</Link>
            <Link to="/book" className="nav-link book-now">Book Now</Link>
            <Link to="/login" className="nav-link login-btn">Login</Link>
          </div>
          
          <div className="nav-toggle" onClick={toggleMenu}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </div>
      </nav>

      {/* Hero Slider Section */}
      <section className="hero-slider">
        <div className="slider-container">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${slide.image})`
              }}
            >
              <div className="hero-content">
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <Link to="/book" className="cta-button">{slide.cta}</Link>
              </div>
            </div>
          ))}
          
          {/* Slider Controls */}
          <button className="slider-btn prev" onClick={prevSlide}>
            <span>‹</span>
          </button>
          <button className="slider-btn next" onClick={nextSlide}>
            <span>›</span>
          </button>
          
          {/* Slider Indicators */}
          <div className="slider-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose Dubai?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏙️</div>
              <h3>Modern Architecture</h3>
              <p>Marvel at the world's tallest building and stunning skyline</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏖️</div>
              <h3>Beautiful Beaches</h3>
              <p>Relax on pristine beaches with crystal clear waters</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛍️</div>
              <h3>Shopping Paradise</h3>
              <p>Explore world-class malls and traditional souks</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🍽️</div>
              <h3>Culinary Delights</h3>
              <p>Taste authentic Emirati cuisine and international flavors</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services">
        <div className="container">
          <h2>Our Premium Services</h2>
          <p className="section-subtitle">Comprehensive travel solutions for your perfect Dubai experience</p>
          
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">✈️</div>
              <h3>Flight Booking</h3>
              <p>Best deals on flights to and from Dubai with major airlines worldwide</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🏨</div>
              <h3>Hotel Booking</h3>
              <p>Luxury hotels, resorts, and boutique accommodations across Dubai</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">💕</div>
              <h3>Honeymoon Packages</h3>
              <p>Romantic getaways and special honeymoon experiences in Dubai</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">👤</div>
              <h3>Solo Trip</h3>
              <p>Adventure packages designed specifically for solo travelers</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">👥</div>
              <h3>Group Tours</h3>
              <p>Exciting group tours with friends, family, or corporate teams</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🎨</div>
              <h3>Custom Tours</h3>
              <p>Personalized tours tailored to your specific interests and schedule</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🐪</div>
              <h3>Desert Safari</h3>
              <p>Thrilling desert adventures with traditional Bedouin experiences</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🗺️</div>
              <h3>Trip Planning</h3>
              <p>Customized itineraries tailored to your interests and preferences</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🚢</div>
              <h3>Cruise Trip Booking</h3>
              <p>Luxury cruise experiences around the Arabian Gulf</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🚗</div>
              <h3>Pick & Drop</h3>
              <p>Reliable airport transfers and city transportation services</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>
            
            <div className="service-card">
              <div className="service-icon">🎯</div>
              <h3>VIP Services</h3>
              <p>Premium concierge services for the ultimate luxury experience</p>
              <Link to="/services" className="service-link">Learn More →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Entertainment Section */}
      <section className="entertainment">
        <div className="container">
          <h2>Dubai Entertainment & Attractions</h2>
          <p className="section-subtitle">Discover the most exciting entertainment options Dubai has to offer</p>
          
          <div className="entertainment-grid">
            <div className="entertainment-card">
              <div className="entertainment-image">
                <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" alt="Burj Khalifa" />
              </div>
              <div className="entertainment-content">
                <h3>Burj Khalifa & Dubai Mall</h3>
                <p>Visit the world's tallest building and explore the largest shopping mall</p>
                <div className="entertainment-features">
                  <span>Observation Deck</span>
                  <span>Shopping</span>
                  <span>Aquarium</span>
                </div>
              </div>
            </div>
            
            <div className="entertainment-card">
              <div className="entertainment-image">
                <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" alt="Palm Jumeirah" />
              </div>
              <div className="entertainment-content">
                <h3>Palm Jumeirah & Atlantis</h3>
                <p>Experience luxury at the iconic palm-shaped island and Atlantis resort</p>
                <div className="entertainment-features">
                  <span>Water Park</span>
                  <span>Aquarium</span>
                  <span>Beach Access</span>
                </div>
              </div>
            </div>
            
            <div className="entertainment-card">
              <div className="entertainment-image">
                <img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" alt="Dubai Frame" />
              </div>
              <div className="entertainment-content">
                <h3>Dubai Frame & Parks</h3>
                <p>Visit the iconic Dubai Frame and explore beautiful parks and gardens</p>
                <div className="entertainment-features">
                  <span>City Views</span>
                  <span>Gardens</span>
                  <span>Photo Ops</span>
                </div>
              </div>
            </div>
            
            <div className="entertainment-card">
              <div className="entertainment-image">
                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" alt="Dubai Opera" />
              </div>
              <div className="entertainment-content">
                <h3>Dubai Opera & Shows</h3>
                <p>Enjoy world-class performances at Dubai Opera and other venues</p>
                <div className="entertainment-features">
                  <span>Opera</span>
                  <span>Ballet</span>
                  <span>Concerts</span>
                </div>
              </div>
            </div>
            
            <div className="entertainment-card">
              <div className="entertainment-image">
                <img src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" alt="Dubai Parks" />
              </div>
              <div className="entertainment-content">
                <h3>Theme Parks & Water Parks</h3>
                <p>Thrilling adventures at IMG Worlds, Motiongate, and Aquaventure</p>
                <div className="entertainment-features">
                  <span>Roller Coasters</span>
                  <span>Water Slides</span>
                  <span>Family Fun</span>
                </div>
              </div>
            </div>
            
            <div className="entertainment-card">
              <div className="entertainment-image">
                <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" alt="Dubai Marina" />
              </div>
              <div className="entertainment-content">
                <h3>Dubai Marina & Dhow Cruise</h3>
                <p>Experience the stunning marina and traditional dhow cruise</p>
                <div className="entertainment-features">
                  <span>Boat Tours</span>
                  <span>Dinner Cruise</span>
                  <span>Marina Views</span>
                </div>
              </div>
            </div>
            
            <div className="entertainment-card">
              <div className="entertainment-image">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80" alt="Global Village" />
              </div>
              <div className="entertainment-content">
                <h3>Global Village & Festivals</h3>
                <p>Experience cultures from around the world at Global Village</p>
                <div className="entertainment-features">
                  <span>Cultural Shows</span>
                  <span>Shopping</span>
                  <span>Food</span>
                </div>
              </div>
            </div>
            
            <div className="entertainment-card">
              <div className="entertainment-image">
                <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" alt="Dubai Miracle Garden" />
              </div>
              <div className="entertainment-content">
                <h3>Miracle Garden & Butterfly Garden</h3>
                <p>Explore the world's largest flower garden and butterfly sanctuary</p>
                <div className="entertainment-features">
                  <span>Flower Displays</span>
                  <span>Butterflies</span>
                  <span>Photo Ops</span>
                </div>
              </div>
            </div>
            
            <div className="entertainment-card">
              <div className="entertainment-image">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80" alt="Dubai Fountains" />
              </div>
              <div className="entertainment-content">
                <h3>Dubai Fountains & Light Shows</h3>
                <p>Witness spectacular fountain shows and light displays</p>
                <div className="entertainment-features">
                  <span>Fountain Shows</span>
                  <span>Light Displays</span>
                  <span>Evening Shows</span>
                </div>
              </div>
            </div>
            
            <div className="entertainment-card">
              <div className="entertainment-image">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80" alt="Dubai Creek" />
              </div>
              <div className="entertainment-content">
                <h3>Old Dubai & Cultural Tours</h3>
                <p>Explore traditional souks, museums, and cultural heritage sites</p>
                <div className="entertainment-features">
                  <span>Traditional Souks</span>
                  <span>Museums</span>
                  <span>Cultural Heritage</span>
                </div>
              </div>
            </div>
            
            <div className="entertainment-card">
              <div className="entertainment-image">
                <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80" alt="Dubai Ski" />
              </div>
              <div className="entertainment-content">
                <h3>Ski Dubai & Indoor Activities</h3>
                <p>Experience snow in the desert at Ski Dubai and indoor entertainment</p>
                <div className="entertainment-features">
                  <span>Skiing</span>
                  <span>Snowboarding</span>
                  <span>Indoor Fun</span>
                </div>
              </div>
            </div>
            
            <div className="entertainment-card">
              <div className="entertainment-image">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80" alt="Dubai Nightlife" />
              </div>
              <div className="entertainment-content">
                <h3>Nightlife & Rooftop Bars</h3>
                <p>Experience Dubai's vibrant nightlife and rooftop dining</p>
                <div className="entertainment-features">
                  <span>Rooftop Bars</span>
                  <span>Nightclubs</span>
                  <span>Fine Dining</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section with Images */}
      <section className="info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-content">
              <h2>Experience Dubai Like Never Before</h2>
              <p>Dubai is a city that never sleeps, offering a perfect blend of traditional Arabian hospitality and modern luxury. From the moment you arrive, you'll be captivated by the stunning architecture, world-class shopping, and endless entertainment options.</p>
              <div className="info-features">
                <div className="info-feature">
                  <span className="feature-icon">🌟</span>
                  <span>World-class shopping destinations</span>
                </div>
                <div className="info-feature">
                  <span className="feature-icon">🌟</span>
                  <span>Luxury hotels and resorts</span>
                </div>
                <div className="info-feature">
                  <span className="feature-icon">🌟</span>
                  <span>Thrilling desert adventures</span>
                </div>
                <div className="info-feature">
                  <span className="feature-icon">🌟</span>
                  <span>Cultural heritage experiences</span>
                </div>
              </div>
              <Link to="/services" className="info-cta">Explore Our Services</Link>
            </div>
            <div className="info-image">
              <img src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80" alt="Dubai Skyline" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="team-section">
        <div className="container">
          <h2>Meet Our Expert Team</h2>
          <p className="section-subtitle">Dedicated professionals committed to making your Dubai experience unforgettable</p>
          
          <div className="team-grid">
            <div className="team-member">
              <div className="member-image">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80" alt="Ahmed Al-Rashid" />
              </div>
              <div className="member-info">
                <h3>Ahmed Al-Rashid</h3>
                <span className="member-role">Senior Travel Consultant</span>
                <p>With 15+ years of experience in luxury travel, Ahmed specializes in creating bespoke experiences for high-end clients.</p>
                <div className="member-expertise">
                  <span className="expertise-tag">Luxury Hotels</span>
                  <span className="expertise-tag">VIP Services</span>
                  <span className="expertise-tag">Honeymoon Planning</span>
                </div>
              </div>
            </div>
            
            <div className="team-member">
              <div className="member-image">
                <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80" alt="Sarah Johnson" />
              </div>
              <div className="member-info">
                <h3>Sarah Johnson</h3>
                <span className="member-role">Adventure Specialist</span>
                <p>Sarah is passionate about creating thrilling experiences for solo travelers and adventure seekers.</p>
                <div className="member-expertise">
                  <span className="expertise-tag">Desert Safari</span>
                  <span className="expertise-tag">Solo Travel</span>
                  <span className="expertise-tag">Adventure Tours</span>
                </div>
              </div>
            </div>
            
            <div className="team-member">
              <div className="member-image">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80" alt="Michael Chen" />
              </div>
              <div className="member-info">
                <h3>Michael Chen</h3>
                <span className="member-role">Group Tour Coordinator</span>
                <p>Michael excels in organizing seamless group tours for families, friends, and corporate teams.</p>
                <div className="member-expertise">
                  <span className="expertise-tag">Group Tours</span>
                  <span className="expertise-tag">Corporate Events</span>
                  <span className="expertise-tag">Family Packages</span>
                </div>
              </div>
            </div>
            
            <div className="team-member">
              <div className="member-image">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80" alt="Fatima Hassan" />
              </div>
              <div className="member-info">
                <h3>Fatima Hassan</h3>
                <span className="member-role">Entertainment & Attractions Specialist</span>
                <p>Fatima specializes in creating unforgettable entertainment experiences and attraction bookings.</p>
                <div className="member-expertise">
                  <span className="expertise-tag">Theme Parks</span>
                  <span className="expertise-tag">Cultural Shows</span>
                  <span className="expertise-tag">Attraction Tickets</span>
                </div>
              </div>
            </div>
            
            <div className="team-member">
              <div className="member-image">
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80" alt="David Wilson" />
              </div>
              <div className="member-info">
                <h3>David Wilson</h3>
                <span className="member-role">Custom Tour Designer</span>
                <p>David creates personalized itineraries that perfectly match your interests and travel style.</p>
                <div className="member-expertise">
                  <span className="expertise-tag">Custom Tours</span>
                  <span className="expertise-tag">Cultural Tours</span>
                  <span className="expertise-tag">Personalized Planning</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Attractions */}
      <section className="attractions">
        <div className="container">
          <h2>Popular Attractions</h2>
          <div className="attractions-grid">
            <div className="attraction-card">
              <div className="attraction-image burj-khalifa"></div>
              <div className="attraction-content">
                <h3>Burj Khalifa</h3>
                <p>Visit the world's tallest building and enjoy breathtaking views</p>
              </div>
            </div>
            <div className="attraction-card">
              <div className="attraction-image palm-jumeirah"></div>
              <div className="attraction-content">
                <h3>Palm Jumeirah</h3>
                <p>Experience luxury at the iconic palm-shaped island</p>
              </div>
            </div>
            <div className="attraction-card">
              <div className="attraction-image dubai-mall"></div>
              <div className="attraction-content">
                <h3>The Dubai Mall</h3>
                <p>Shop at the world's largest shopping mall</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <h2>What Our Guests Say</h2>
          <p className="section-subtitle">Real experiences from travelers who discovered Dubai with us</p>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Absolutely incredible experience! The desert safari was the highlight of our trip. The team made everything seamless and unforgettable."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👤</div>
                <div className="author-info">
                  <h4>Sarah Johnson</h4>
                  <span>New York, USA</span>
                  <div className="rating">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"The luxury hotel booking service exceeded our expectations. We stayed at the most beautiful resort with amazing views of the Burj Khalifa."</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👤</div>
                <div className="author-info">
                  <h4>Michael Chen</h4>
                  <span>London, UK</span>
                  <div className="rating">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            </div>
            
            <div className="testimonial-card">
              <div className="testimonial-content">
                <p>"Professional service from start to finish. The trip planning was perfect, and the pick-up service was always on time. Highly recommended!"</p>
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">👤</div>
                <div className="author-info">
                  <h4>Emma Rodriguez</h4>
                  <span>Toronto, Canada</span>
                  <div className="rating">⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Experience Dubai?</h2>
          <p>Book your dream vacation today and create unforgettable memories</p>
          <Link to="/book" className="cta-button">Book Your Trip</Link>
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

export default LandingPage; 