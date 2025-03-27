import React, { createContext, useState } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Hard-coded to false (light mode only)
  const isDarkMode = false;
  
  // Dummy function that doesn't actually toggle
  const toggleDarkMode = () => {
    // No operation
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};