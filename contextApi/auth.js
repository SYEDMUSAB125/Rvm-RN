// contexts/AuthContext.js
import React, { createContext, useContext, useState } from 'react';
import { getRecycledetails, getUserByPhoneNumber, registerUser } from './profileApi';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    status: 'idle',
    error: null,
    responseData: null,
  });

  const register = async (userData) => {
    setAuthState(prev => ({ ...prev, status: 'loading', error: null }));
    
    try {
      // 1. First make the registration call
      const registrationResult = await registerUser(userData);
      
      // 2. If registration is successful, fetch user details
      if (registrationResult.success) {
        const userDetails = await getUserByPhoneNumber(userData.phoneNumber);
        const recycleDetails = await getRecycledetails(userData.phoneNumber);
        setAuthState({
          recycleDetails: recycleDetails.data,
          user: userDetails.data, // Store the complete user data
          status: 'success',
          error: null,
          responseData: userDetails.data,
        });
        
        return userDetails;
      }
      
      throw new Error('Registration failed');
    } catch (error) {
      setAuthState({
        user: null,
        status: 'error',
        error: error.message,
        responseData: error.responseData || null,
      });
      
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);










