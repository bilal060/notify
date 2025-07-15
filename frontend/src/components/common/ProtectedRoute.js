import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  // Check for authentication
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Check if user is authenticated
  const isAuthenticated = token && user.email;
  
  // Check if admin is required and user is admin
  const isAdmin = user.isAdmin || user.role === 'admin';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If admin is required but user is not admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default ProtectedRoute; 