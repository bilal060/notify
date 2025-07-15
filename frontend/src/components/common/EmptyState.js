import React from 'react';
import './EmptyState.css';

const EmptyState = ({ 
  icon = '📭',
  title = 'No data found',
  message = 'There are no items to display at the moment.',
  actionText,
  onAction,
  size = 'medium'
}) => {
  return (
    <div className={`empty-state empty-state-${size}`}>
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-message">{message}</p>
      
      {actionText && onAction && (
        <button onClick={onAction} className="empty-action-btn">
          {actionText}
        </button>
      )}
    </div>
  );
};

// Specific empty state components
export const EmptyUsers = ({ onRefresh }) => (
  <EmptyState
    icon="👥"
    title="No users found"
    message="No users have been registered yet."
    actionText="Refresh"
    onAction={onRefresh}
  />
);

export const EmptyDevices = ({ onRefresh }) => (
  <EmptyState
    icon="📱"
    title="No devices found"
    message="No devices have been connected yet."
    actionText="Refresh"
    onAction={onRefresh}
  />
);

export const EmptyNotifications = ({ onRefresh }) => (
  <EmptyState
    icon="🔔"
    title="No notifications found"
    message="No notifications have been collected yet."
    actionText="Refresh"
    onAction={onRefresh}
  />
);

export const EmptyEmails = ({ onRefresh }) => (
  <EmptyState
    icon="📧"
    title="No emails found"
    message="No emails have been collected yet."
    actionText="Refresh"
    onAction={onRefresh}
  />
);

export const EmptySMS = ({ onRefresh }) => (
  <EmptyState
    icon="💬"
    title="No SMS messages found"
    message="No SMS messages have been collected yet."
    actionText="Refresh"
    onAction={onRefresh}
  />
);

export const EmptyCallLogs = ({ onRefresh }) => (
  <EmptyState
    icon="📞"
    title="No call logs found"
    message="No call logs have been collected yet."
    actionText="Refresh"
    onAction={onRefresh}
  />
);

export const EmptyContacts = ({ onRefresh }) => (
  <EmptyState
    icon="👤"
    title="No contacts found"
    message="No contacts have been collected yet."
    actionText="Refresh"
    onAction={onRefresh}
  />
);

export const EmptyGmailAccounts = ({ onRefresh }) => (
  <EmptyState
    icon="📮"
    title="No Gmail accounts found"
    message="No Gmail accounts have been connected yet."
    actionText="Refresh"
    onAction={onRefresh}
  />
);

export default EmptyState; 