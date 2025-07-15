import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './NetworkStatus.css';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      toast.success('You are back online!');
      
      // Hide banner after 3 seconds
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      toast.error('You are offline. Some features may not work.');
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div className={`network-banner ${isOnline ? 'online' : 'offline'}`}>
      <div className="network-content">
        <span className="network-icon">
          {isOnline ? '🌐' : '📡'}
        </span>
        <span className="network-message">
          {isOnline ? 'You are back online!' : 'You are offline. Check your connection.'}
        </span>
        <button 
          onClick={() => setShowBanner(false)}
          className="network-close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default NetworkStatus; 