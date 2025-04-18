// api/users.js
import axios from 'axios';

// Configure axios instance
const api = axios.create({
  baseURL: 'http://192.168.221.252:3000', // Your backend base URL
  timeout: 10000, // 10 second timeout
});


export const getUserByPhoneNumber = async (phoneNumber) => {
  try {
    if (!phoneNumber) {
      throw {
        message: 'Phone number is required',
        isValidationError: true
      };
    }

    const response = await api.get(`/getuser/${encodeURIComponent(phoneNumber)}`);
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
    
  } catch (error) {
    console.error('Error fetching user:', error);
    
    // Enhanced error handling
    if (axios.isCancel(error)) {
      throw {
        message: 'Request was cancelled',
        isNetworkError: false,
        isCancelled: true
      };
    } else if (error.code === 'ECONNABORTED') {
      throw {
        message: 'Request timeout. Please check your connection.',
        isNetworkError: true,
        isTimeout: true
      };
    } else if (!error.response) {
      // Network error (no response received)
      throw {
        message: 'Network error. Please check your internet connection.',
        isNetworkError: true
      };
    } else {
      // Server responded with error status
      const status = error.response?.status;
      let message = 'Failed to fetch user data';
      
      if (status === 404) {
        message = 'User not found';
      } else if (status === 400) {
        message = 'Invalid request';
      } else if (status >= 500) {
        message = 'Server error. Please try again later.';
      }
      
      throw {
        message: error.response.data?.error || message,
        status,
        serverError: true,
        responseData: error.response.data
      };
    }
  }
};