import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { tokenManager } from "../services/api";

const ProtectedRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  
  useEffect(() => {
    // Use tokenManager to check if token is valid
    const isValid = tokenManager.isTokenValid() && !tokenManager.isTokenExpired();
    setIsAuthenticated(isValid);
  }, []);
  
  // Show loading until we verify authentication
  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
    </div>;
  }
  
  // If authenticated, render the protected component
  // Otherwise, redirect to login page
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute; 