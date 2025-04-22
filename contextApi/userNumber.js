// This function updates the user profile with the provided phone number and update data.


import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRecycledetails, getUserByPhoneNumber } from './profileApi';

export const checkPhoneNumberExists = async (phoneNumber) => {
  try {
    console.log('Checking phone number:', phoneNumber);
    
    let userResponse, verifiedRegistrationResponse;
    
    try {
      // Make both requests in parallel
      [userResponse, verifiedRegistrationResponse] = await Promise.all([
        axios.get(`https://rvm-backend.vercel.app/users/${phoneNumber}`),
        axios.get(`https://rvm-backend.vercel.app/verifiedregister/${phoneNumber}`)
      ]);
      
      console.log('User response status:', userResponse.status);
      console.log('Verified registration status:', verifiedRegistrationResponse.status);
      
    } catch (error) {
      // Handle cases where one or both requests fail
      if (axios.isAxiosError(error)) {
        // If user doesn't exist at all
        if (error.response?.status === 404 && error.config.url.includes('/users/')) {
          return {
            exists: false,
            status: 404,
            isRegistered: false,
            message: 'Number not registered'
          };
        }
        
        // If verified registration check fails but user exists
        if (error.response?.status === 404 && error.config.url.includes('/verifiedregister/')) {
          // User exists but not verified
          return {
            exists: true,
            isRegistered: false,
            response: 200, // user exists
            verification: 404, // not verified
            message: 'Number exists but not fully verified'
          };
        }
        
        throw error;
      }
      throw error;
    }

    // If we get here, both requests succeeded
    if (verifiedRegistrationResponse.status === 200) {
      // Fetch user and recycle details in parallel
      const [userDetails, RecycleDetails] = await Promise.all([
        getUserByPhoneNumber(phoneNumber),
        getRecycledetails(phoneNumber)
      ]);

      try {
        const key = 'userDetails';
        const value = JSON.stringify(userDetails.data);
        await AsyncStorage.setItem(key, value);
        console.log('Data stored successfully in AsyncStorage');
      } catch (storageError) {
        console.error('AsyncStorage error:', storageError);
      }

      return {
        exists: true,
        isRegistered: true,
        response: userResponse.status,
        verification: verifiedRegistrationResponse.status,
        userDetails: userDetails.data,
        recycleDetails: RecycleDetails.data
      };
    }

    // This is a fallback for unexpected cases where verified registration exists but status isn't 200
    return {
      exists: true,
      isRegistered: false,
      response: userResponse.status,
      verification: verifiedRegistrationResponse.status,
      message: 'Number exists but verification status unclear'
    };
    
  } catch (error) {
    console.error('API Error:', error.response?.status, error.message);
    
    if (axios.isAxiosError(error)) {
      throw {
        message: error.message,
        status: error.response?.status || 500,
        isNetworkError: !error.response
      };
    }
    
    console.error('Unexpected error:', error);
    throw {
      message: 'Unexpected error occurred',
      status: 500
    };
  }
};