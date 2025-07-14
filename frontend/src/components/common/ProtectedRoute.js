import React from 'react';
import { Navigate } from 'react-router-dom';

const isAuthenticated = false; // Placeholder: Replace with real auth logic

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute; 