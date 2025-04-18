// import axios from 'axios';
// import { getRecycledetails, getUserByPhoneNumber } from './profileApi';

// export const checkPhoneNumberExists = async (phoneNumber) => {
//   try {
//     console.log('Checking phone number:', phoneNumber);
    
//     const response = await axios.get(`http://192.168.8.111:3000/users/${phoneNumber}`);
//     const verifiedregistration = await axios.get(`http://192.168.8.111:3000/verifiedregister/${phoneNumber}`);
//     if(verifiedregistration.status === 200){
//       const userDetails = await getUserByPhoneNumber(phoneNumber)
//       const RecycleDetails = await getRecycledetails(phoneNumber)
   

//       console.log('API Response:', response.data);
//       console.log('User Details:', userDetails.data);
//       return {
//         response: response.status,
//          verification : verifiedregistration.status,
//          userDetails: userDetails.data,
        
//        }
//     }

   
    
//     // Return structured response
    
    
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       console.error('API Error:', error.response?.status, error.message);
      
//       if (error.response?.status === 404) {
//         return {
//           exists: false,
//           status: 404,
//           isRegistered: false,
//           message: 'Number not registered'
//         };
//       }
      
//       // For other errors, throw to be caught by the caller
//       throw {
//         message: error.message,
//         status: error.response?.status || 500,
//         isNetworkError: !error.response
//       };
//     }
    
//     // Non-Axios errors
//     console.error('Unexpected error:', error);
//     throw {
//       message: 'Unexpected error occurred',
//       status: 500
//     };
//   }
// };




// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { getRecycledetails, getUserByPhoneNumber } from './profileApi';

// export const checkPhoneNumberExists = async (phoneNumber) => {
//   try {
//     console.log('Checking phone number:', phoneNumber);
    
//     // Execute all initial requests in parallel for better performance
//     const [response, verifiedregistration] = await Promise.all([
//       axios.get(`http://192.168.8.112:3000/users/${phoneNumber}`),
//       axios.get(`http://192.168.8.112:3000/verifiedregister/${phoneNumber}`)
//     ]);


// console.log(response.status, verifiedregistration.status)


//     if (verifiedregistration.status === 200) {
//       // Fetch user and recycle details in parallel
//       const [userDetails, RecycleDetails] = await Promise.all([
//         getUserByPhoneNumber(phoneNumber),
//         getRecycledetails(phoneNumber)
//       ]);


//       try {
//         const key = 'userDetails';
//         const value = JSON.stringify(userDetails.data);
//         await AsyncStorage.setItem(key, value);
//         console.log('Data stored successfully in AsyncStorage');
//       } catch (storageError) {
//         console.error('AsyncStorage error:', storageError);
//       }

//       return {
//         exists: true,
//         isRegistered: true,
//         response: response.status,
//         verification: verifiedregistration.status,
//         userDetails: userDetails.data,
//         recycleDetails: RecycleDetails.data
//       };
//     }

//     // Number exists but not fully verified
//     return {
//       exists: true,
//       isRegistered: false,
//       response: response.status,
//       verification: verifiedregistration.status,
//       message: 'Number exists but not fully verified'
//     };
    
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       console.error('API Error:', error.response?.status, error.message);
      
//       if (error.response?.status === 404) {
//         return {
//           exists: false,
//           status: 404,
//           isRegistered: false,
//           message: 'Number not registered'
//         };
//       }
      
//       throw {
//         message: error.message,
//         status: error.response?.status || 500,
//         isNetworkError: !error.response
//       };
//     }
    
//     console.error('Unexpected error:', error);
//     throw {
//       message: 'Unexpected error occurred',
//       status: 500
//     };
//   }
// };





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
        axios.get(`http://192.168.221.252:3000/users/${phoneNumber}`),
        axios.get(`http://192.168.221.252:3000/verifiedregister/${phoneNumber}`)
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