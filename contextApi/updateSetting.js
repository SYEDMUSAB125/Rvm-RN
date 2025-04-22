

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

    const response = await fetch(`https://rvm-backend.vercel.app/update-profile/${phoneNumber}`, {
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