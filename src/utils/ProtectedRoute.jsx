import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element }) => {
  // Check if user is authenticated by looking for the token in localStorage
  const isAuthenticated = localStorage.getItem("userToken");

  // If authenticated, render the protected component
  // Otherwise, redirect to login page
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default ProtectedRoute; 