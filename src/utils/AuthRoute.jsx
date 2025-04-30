import React from "react";
import { Navigate } from "react-router-dom";

const AuthRoute = ({ element }) => {
  // Check if user is authenticated by looking for the token in localStorage
  const isAuthenticated = localStorage.getItem("userToken");

  // If authenticated, redirect to home page
  // Otherwise, render the requested auth page (login, signup, etc.)
  return isAuthenticated ? <Navigate to="/home" replace /> : element;
};

export default AuthRoute; 