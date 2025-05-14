import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenManager, refreshToken } from '../services/api';

/**
 * Custom hook to handle authentication validation
 * Verifies token on component mount and provides login/logout functions
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      setIsLoading(true);
      try {
        // Use tokenManager to check token validity
        if (!tokenManager.isTokenValid()) {
          setIsAuthenticated(false);
          setUser(null);
          return false;
        }
        
        // Check if token is expired and try to refresh it
        if (tokenManager.isTokenExpired()) {
          console.log('Token is expired, attempting to refresh from useAuth hook');
          const newToken = await refreshToken();
          
          if (!newToken) {
            console.log('Token refresh failed in useAuth hook');
            setIsAuthenticated(false);
            setUser(null);
            return false;
          }
          
          console.log('Token refreshed successfully from useAuth hook');
        }
        
        // Set authenticated state
        setIsAuthenticated(true);
        
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        
        // Set user data if available
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          } catch (error) {
            console.error('Error parsing user data:', error);
            setUser(null);
          }
        }
        
        return true;
      } catch (error) {
        console.error('Auth validation error:', error);
        setIsAuthenticated(false);
        setUser(null);
        return false;
      } finally {
        setIsLoading(false);
      }
    };
    
    // Run validation
    validateToken();
  }, []);
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };
  
  // Force login redirect
  const redirectToLogin = () => {
    navigate('/login');
  };
  
  // Function to manually refresh token
  const checkAndRefreshToken = async () => {
    if (!tokenManager.isTokenValid()) {
      return false;
    }
    
    if (tokenManager.isTokenExpired()) {
      const newToken = await refreshToken();
      return !!newToken;
    }
    
    return true;
  };
  
  return { 
    isAuthenticated, 
    user, 
    isLoading,
    logout,
    redirectToLogin,
    checkAndRefreshToken
  };
};

export default useAuth; 