// export const updateUserProfile = async (userId, updateData) => {
//     try {
//       const formData = new FormData();
//       formData.append('username', updateData.username);
//       formData.append('age', updateData.age);
      
//       // Handle profile picture - React Native specific format
//       if (updateData.profilePic && typeof updateData.profilePic === 'string' && 
//           !updateData.profilePic.startsWith('http')) {
//         const filename = updateData.profilePic.split('/').pop();
//         const fileType = filename.split('.').pop();
        
//         formData.append('profilePic', {
//           uri: updateData.profilePic,
//           name: filename,
//           type: `image/${fileType}`,
//         });
//       }
  
//       console.log("Updating profile for user ID:", userId);
      
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
  
//       const response = await fetch(`http://192.168.194.172:3000/update-profile/${userId}`, {
//         method: 'PUT',
//         body: formData,
//         signal: controller.signal,
//         // Let the browser set the Content-Type automatically
//       });
  
//       clearTimeout(timeoutId);
  
//       const result = await response.json();
      
//       if (!response.ok) {
//         throw new Error(result.message || 'Failed to update profile');
//       }
  
//       return result;
//     } catch (error) {
//       console.error('API Error:', error);
//       if (error.name === 'AbortError') {
//         throw new Error('Request timed out');
//       }
//       throw new Error(error.message || 'Network request failed');
//     }
//   };



export const updateUserProfile = async (phoneNumber, updateData) => {
  try {
    // Create the request body with only the allowed fields
    const requestBody = {
      username: updateData.username,
      age: updateData.age,
      // Note: We're not sending profilePic as it's handled via default avatars now
    };

    console.log("Updating profile for phone number:", phoneNumber);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`http://192.168.221.252:3000/update-profile/${phoneNumber}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update profile');
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw new Error(error.message || 'Network request failed');
  }
};