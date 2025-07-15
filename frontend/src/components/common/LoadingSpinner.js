import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  type = 'spinner',
  fullScreen = false 
}) => {
  const sizeClass = `spinner-${size}`;
  const typeClass = `spinner-${type}`;

  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className={`loading-spinner ${sizeClass} ${typeClass}`}>
          {type === 'dots' && (
            <div className="dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          )}
          {type === 'spinner' && <div className="spinner"></div>}
          {type === 'pulse' && <div className="pulse"></div>}
          {message && <p className="loading-message">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`loading-container ${sizeClass}`}>
      <div className={`loading-spinner ${sizeClass} ${typeClass}`}>
        {type === 'dots' && (
          <div className="dots">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
        {type === 'spinner' && <div className="spinner"></div>}
        {type === 'pulse' && <div className="pulse"></div>}
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner; 