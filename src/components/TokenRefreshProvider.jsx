import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { refreshToken, tokenManager } from '../services/api';

const TokenRefreshProvider = ({ children }) => {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  // Convert setupRefreshTimer to useCallback to avoid recreation on every render
  const setupRefreshTimer = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // Check if token exists and is valid
    if (!tokenManager.isTokenValid()) {
      console.log('No valid token to refresh');
      return;
    }
    
    // Calculate when to refresh the token (e.g., 5 minutes before expiration)
    const remainingTime = tokenManager.getTokenRemainingTime();
    const refreshThreshold = 5 * 60; // 5 minutes in seconds
    
    // If token will expire soon or has already expired
    if (remainingTime <= refreshThreshold) {
      console.log('Token expiring soon or already expired, refreshing now');
      performTokenRefresh();
      return;
    }
    
    // Otherwise, set timer to refresh 5 minutes before expiration
    const timeUntilRefresh = (remainingTime - refreshThreshold) * 1000; // Convert to milliseconds
    console.log(`Setting up token refresh in ${Math.round(timeUntilRefresh / 1000 / 60)} minutes`);
    
    // Use the ref instead of state to track the timer
    timerRef.current = setTimeout(() => {
      performTokenRefresh();
    }, timeUntilRefresh);
  }, [navigate]); // Only navigate should be a dependency
  
  // Function to perform the actual token refresh
  const performTokenRefresh = useCallback(async () => {
    if (refreshing) return; // Prevent concurrent refreshes
    
    try {
      setRefreshing(true);
      console.log('Performing scheduled token refresh');
      const newToken = await refreshToken();
      
      if (newToken) {
        console.log('Token refreshed successfully from scheduled refresh');
        // Setup the next refresh cycle, but after a small delay to avoid immediate re-render issues
        setTimeout(() => {
          setupRefreshTimer();
        }, 100);
      } else {
        console.log('Scheduled token refresh failed');
        // If refresh fails and we're not on login page, redirect
        if (window.location.pathname !== '/login') {
          navigate('/login');
        }
      }
    } finally {
      setRefreshing(false);
    }
  }, [setupRefreshTimer, navigate, refreshing]);
  
  // Setup initial timer and cleanup on unmount
  useEffect(() => {
    // Only setup timer if not currently refreshing
    if (!refreshing) {
      setupRefreshTimer();
    }
    
    // Listen for visibility changes to refresh token when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !refreshing) {
        console.log('Tab became visible, checking token status');
        // Slight delay to prevent rapid consecutive calls
        setTimeout(() => {
          setupRefreshTimer();
        }, 100);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setupRefreshTimer, refreshing]);
  
  // Simply render children - this component just handles the refresh logic
  return <>{children}</>;
};

export default TokenRefreshProvider; 