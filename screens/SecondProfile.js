import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contextApi/auth';
import male from "../assets/images/male-avatar.png"
import female from "../assets/images/female-avatar.png"
import other from "../assets/images/neutral-avatar.png"

// Local image references for display
const LOCAL_AVATARS = {
  male,
  female,
  other
};

const SecondProfile = ({ route, navigation }) => {
  const { mobileNumber } = route.params;
  const { register } = useAuth();
  
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [loading, setLoading] = useState(false);

  const AVATAR_PATHS = {
    male: "assets/images/male-avatar.png",
    female: "assets/images/female-avatar.png",
    other: "assets/images/neutral-avatar.png"
  };
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
         profilePic: AVATAR_PATHS[gender] || AVATAR_PATHS.male
      };

      setLoading(true);
      const result = await register(userData);
      setLoading(false);
      
      if (result?.success) {
        Alert.alert('Success', 'Registration completed successfully!', [
          { 
            text: 'OK', 
            onPress: () => {
              navigation.navigate('Home', { 
                user: {
                  ...result.data,
                  profilePic: LOCAL_AVATARS[gender] || LOCAL_AVATARS.male
                }
              });
            }
          }
        ]);
      } else {
        Alert.alert('Success', 'Registration completed!', [
          { 
            text: 'OK', 
            onPress: () => {
              navigation.navigate('Home', { 
                user: {
                  phoneNumber: mobileNumber,
                  username,
                  age: parseInt(age),
                  gender,
                  profilePic: LOCAL_AVATARS[gender] || LOCAL_AVATARS.male
                }
              });
            }
          }
        ]);
      }
    } catch (error) {
      setLoading(false);
      console.error('Registration error:', error);
      
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
      
      {/* Profile Picture - using local image reference for display */}
      <View style={styles.profilePicContainer}>
        <Image 
          source={LOCAL_AVATARS[gender] || LOCAL_AVATARS.male} 
          style={styles.profilePic} 
          resizeMode="cover"
        />
      </View>

      {/* Username */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
          maxLength={30}
          autoCapitalize="words"
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
          maxLength={3}
        />
      </View>

      {/* Gender */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.pickerContainer}>
          <Picker
            mode="dropdown"
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Male" value="male" style={styles.item} />
            <Picker.Item label="Female" value="female" style={styles.item} />
            <Picker.Item label="Other" value="other" style={styles.item} />
          </Picker>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.submitButton, loading && styles.disabledButton]} 
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
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
    padding: 20,
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
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
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
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#6C63FF',
  },
  profilePic: {
    width: '100%',
    height: '100%',
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
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SecondProfile;