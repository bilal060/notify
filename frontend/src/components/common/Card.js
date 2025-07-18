import React from 'react';
import './Card.css';

const Card = ({
  children,
  title,
  subtitle,
  header,
  footer,
  padding = 'medium',
  elevation = 'medium',
  hoverable = false,
  className = '',
  onClick,
  ...props
}) => {
  const cardClass = [
    'card',
    `card--padding-${padding}`,
    `card--elevation-${elevation}`,
    hoverable ? 'card--hoverable' : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div 
      className={cardClass}
      onClick={handleClick}
      {...props}
    >
      {header && (
        <div className="card__header">
          {header}
        </div>
      )}
      
      {(title || subtitle) && (
        <div className="card__title-section">
          {title && <h3 className="card__title">{title}</h3>}
          {subtitle && <p className="card__subtitle">{subtitle}</p>}
        </div>
      )}
      
      <div className="card__content">
        {children}
      </div>
      
      {footer && (
        <div className="card__footer">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card; 