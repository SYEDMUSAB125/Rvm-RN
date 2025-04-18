import axios from 'axios';

// Create a configured axios instance
const api = axios.create({
  baseURL: 'http://192.168.221.252:3000', // Use baseURL instead of repeating it
  timeout: 10000, // Set a reasonable timeout (10 seconds)
});

// export const registerUser = async (userData) => {
//   try {
//     console.log('Registering user with data:', userData);
    
//     // Create a regular object instead of FormData since we're not uploading files
//     const requestData = {
//       phoneNumber: userData.phoneNumber,
//       username: userData.username,
//       age: userData.age,
//       gender: userData.gender,
//       profilePicPath: userData.profilePic // Just send the path reference
//     };

//     const response = await api.post('/register', requestData, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//       },
//       timeout: 10000,
//     });


//     return {
//       success: true,
//       data: response.data,
//       status: response.status
//     };

//   } catch (error) {
//     console.error('Registration error:', error);
    
//     // Enhanced error handling
//     if (axios.isCancel(error)) {
//       throw {
//         message: 'Request was cancelled',
//         isNetworkError: false,
//         isCancelled: true
//       };
//     } else if (error.code === 'ECONNABORTED') {
//       throw {
//         message: 'Request timeout. Please check your connection.',
//         isNetworkError: true,
//         isTimeout: true
//       };
//     } else if (!error.response) {
//       // No response received (network error)
//       throw {
//         message: 'Network error. Please check your internet connection.',
//         isNetworkError: true
//       };
//     } else {
//       // Server responded with error status
//       const status = error.response?.status;
//       let message = 'Registration failed';
      
//       if (status === 409) {
//         message = error.response.data?.message || 'User already exists';
//       } else if (status === 400) {
//         message = error.response.data?.message || 'Invalid request data';
//       } else if (status >= 500) {
//         message = 'Server error. Please try again later.';
//       }
      
//       throw {
//         message,
//         status,
//         serverError: true,
//         responseData: error.response.data
//       };
//     }
//   }
// };


export const registerUser = async (userData) => {
  try {
    console.log('Registering user with data:', userData);
    
    // Create a regular object instead of FormData since we're not uploading files
    const requestData = {
      phoneNumber: userData.phoneNumber,
      username: userData.username,
      age: userData.age,
      gender: userData.gender,
      profilePicPath: userData.profilePic // Just send the path reference
    };

    // 1. First make the registration request
    const response = await api.post('/register', requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    // 2. If registration is successful, update the username in all sessions
    try {
      const updateResponse = await api.post('/updateUser', {
        phoneNumber: userData.phoneNumber,
        userName: userData.username
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000 // Shorter timeout for this secondary request
      });

      console.log('Username updated in all sessions:', updateResponse.data);
    } catch (updateError) {
      console.warn('Failed to update username in sessions:', updateError);
      // We'll still consider registration successful even if this fails
      // You might want to implement retry logic here if needed
    }

    return {
      success: true,
      data: response.data,
      status: response.status
    };

  } catch (error) {
    console.error('Registration error:', error);
    
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
      // No response received (network error)
      throw {
        message: 'Network error. Please check your internet connection.',
        isNetworkError: true
      };
    } else {
      // Server responded with error status
      const status = error.response?.status;
      let message = 'Registration failed';
      
      if (status === 409) {
        message = error.response.data?.message || 'User already exists';
      } else if (status === 400) {
        message = error.response.data?.message || 'Invalid request data';
      } else if (status >= 500) {
        message = 'Server error. Please try again later.';
      }
      
      throw {
        message,
        status,
        serverError: true,
        responseData: error.response.data
      };
    }
  }
};





export const getUserByPhoneNumber = async (phoneNumber) => {
    try {
      const response = await api.get(`/getuser/${encodeURIComponent(phoneNumber)}`);
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      
      if (!error.response) {
        throw {
          message: 'Network error. Please check your connection.',
          isNetworkError: true
        };
      }
      
      throw {
        message: error.response.data?.error || 'Failed to fetch user',
        status: error.response.status,
        responseData: error.response.data
      };
    }
  };





  export const getRecycledetails = async (phoneNumber) => {
    try {
      const response = await api.get(`/getrecycle/${encodeURIComponent(phoneNumber)}`);
      
      return {
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      
      if (!error.response) {
        throw {
          message: 'Network error. Please check your connection.',
          isNetworkError: true
        };
      }
      
      throw {
        message: error.response.data?.error || 'Failed to fetch user',
        status: error.response.status,
        responseData: error.response.data
      };
    }
  };