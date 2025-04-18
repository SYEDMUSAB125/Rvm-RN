// Create a new file: contexts/DrawerThemeContext.js
import React, { createContext, useState, useContext } from 'react';

const DrawerThemeContext = createContext();

export const DrawerThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <DrawerThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DrawerThemeContext.Provider>
  );
};

export const useDrawerTheme = () => {
  const context = useContext(DrawerThemeContext);
  if (!context) {
    throw new Error('useDrawerTheme must be used within a DrawerThemeProvider');
  }
  return context;
};