import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../contextApi/auth';
const ProfileRegistration = ({ route, navigation }) => {
  const { mobileNumber } = route.params;
  const { register, status, user } = useAuth();

  
  const [profilePic, setProfilePic] = useState(null);
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [loading, setLoading] = useState(false);

  const selectImage = () => {
    const options = {
      title: 'Select Profile Picture',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        setProfilePic(response.assets[0].uri); // Note: response structure changed in newer versions
      }
    });
  };

  // const handleSubmit = async () => {
  //   if (!username.trim()) {
  //     Alert.alert('Error', 'Please enter a username');
  //     return;
  //   }
  
  //   if (!age || isNaN(age) || age < 13 || age > 120) {
  //     Alert.alert('Error', 'Please enter a valid age between 13 and 120');
  //     return;
  //   }
  
  //   setLoading(true);
  
  //   try {
  //     const userData = {
  //       phoneNumber: mobileNumber,
  //       username,
  //       age: parseInt(age),
  //       gender,
  //       profilePic
  //     };
  
  //     const result = await registerUser(userData);
  
  //     if (result.success) {
  //       Alert.alert('Success', 'Registration completed successfully!', [
  //         { text: 'OK', onPress: () => navigation.navigate('Home', {userData}) }
  //       ]);
  //     } else {
  //       Alert.alert('Error', result.message || 'Registration failed');
  //     }
  //   } catch (error) {
  //     console.error('Registration error:', error);
      
  //     let errorMessage = 'Registration failed. Please try again.';
      
  //     if (error.response) {
  //       // The request was made and the server responded with a status code
  //       if (error.response.status === 409) {
  //         errorMessage = 'This number is already registered';
         
  //       } else {
  //         errorMessage = error.response.data.message || errorMessage;
  //       }
  //     } else if (error.request) {
  //       // The request was made but no response was received
  //       errorMessage = 'Network error. Please check your connection.';
  //     } else {
  //       // Something happened in setting up the request
  //       errorMessage = error.message || errorMessage;
  //     }
  
  //     Alert.alert('Error', errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const handleSubmit = async () => {
    // Input validation
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }
  
    if (!age || isNaN(age) || age < 13 || age > 120) {
      Alert.alert('Error', 'Please enter a valid age between 13 and 120');
      return;
    }
  
    try {
      const userData = {
        phoneNumber: mobileNumber,
        username,
        age: parseInt(age),
        gender,
        profilePic
      };
  
      // Start registration process
      const result = await register(userData);
      
      // Check if registration was successful
      if (result && result.success) {
        // Show success message
        Alert.alert('Success', 'Registration completed successfully!', [
          { 
            text: 'OK', 
            onPress: () => {
              // Navigate to Home with the complete user data
              navigation.navigate('Home', { 
                user: result.data // Contains the full user data from getUser API
              });
            }
          }
        ]);
      } else {
        // Handle case where registration succeeded but getUser failed
        Alert.alert('Success', 'Registration completed!', [
          { 
            text: 'OK', 
            onPress: () => {
              // Navigate with basic data if full user data isn't available
              navigation.navigate('Home', { 
                user: {
                  phoneNumber: mobileNumber,
                  username,
                  age: parseInt(age),
                  gender,
                  profilePic
                }
              });
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error cases
      if (error.status === 409) {
        Alert.alert('Account Exists', 'This number is already registered', [
          { 
            text: 'Login Instead', 
            onPress: () => navigation.navigate('Login', { phoneNumber: mobileNumber })
          },
          { text: 'Cancel', style: 'cancel' }
        ]);
      } else if (error.isNetworkError) {
        Alert.alert('Network Error', 'Please check your internet connection and try again');
      } else {
        Alert.alert('Error', error.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      


      {/* Profile Picture Upload */}
      <TouchableOpacity style={styles.profilePicContainer} onPress={selectImage}>
        {profilePic ? (
          <Image source={{ uri: profilePic }} style={styles.profilePic} />
        ) : (
          <View style={styles.profilePicPlaceholder}>
            <Icon name="camera" size={30} color="#666" />
            <Text style={styles.uploadText}>Upload Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Username */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
        />
      </View>
         {/* Phone Number (non-editable) */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.mobileNumberContainer}>
          <Text style={styles.mobileNumberText}>{mobileNumber}</Text>
        </View>
      </View>
      
      {/* Age */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your age"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />
      </View>

      {/* Gender */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.pickerContainer}>
          <Picker
           mode="dropdown"
           selectedValue={gender || 'male'} // Provide fallback
           onValueChange={(itemValue) => {
            setGender(itemValue);
          }}
            style={styles.picker}
          >
            <Picker.Item label="Male" value="male" style={styles.item} />
            <Picker.Item label="Female" value="female" style={styles.item} />
            <Picker.Item label="Prefer not to say" value="other" style={styles.item} />
          </Picker>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Complete Registration</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 60,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mobileNumberContainer: {
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  mobileNumberText: {
    fontSize: 16,
    color: '#333',
  },
  profilePicContainer: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profilePicPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  uploadText: {
    marginTop: 5,
    color: '#666',
  },
  pickerContainer: {
    backgroundColor: 'grey',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  item:{
    color: 'black',
    backgroundColor: 'white',
  },

  submitButton: {
    backgroundColor: '#6C63FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileRegistration;