

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUserProfile } from '../contextApi/updateSetting';

// Default avatar images
const DEFAULT_AVATARS = {
  male: require('../assets/images/male-avatar.png'),
  female: require('../assets/images/female-avatar.png'),
  other: require('../assets/images/neutral-avatar.png')
};

const SettingsScreen = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [scaleValue] = useState(new Animated.Value(1));
  const [isSaving, setIsSaving] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('userDetails');
        if (jsonValue) {
          const parsedData = JSON.parse(jsonValue);
          setUserData(parsedData);
          setUsername(parsedData.username);
          setAge(parsedData.age?.toString() || '');
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleSave = async () => {
    if (!userData?.phoneNumber) {
      Alert.alert('Error', 'User data not loaded properly');
      return;
    }

    setIsSaving(true);
    
    try {
      const updateData = {
        username,
        age: parseInt(age) || 0,
        // We're not sending profilePic here since we're using default paths
      };

      // Call the API to update profile
      const result = await updateUserProfile(userData.phoneNumber, updateData);
      
      // Update local storage with the new data
      const updatedUser = {
        ...userData,
        ...updateData,
        // Keep existing profilePic path or use default
        profilePic: userData.profilePic || DEFAULT_AVATARS[userData.gender || 'male']
      };
      
      await AsyncStorage.setItem('userDetails', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getProfileImageSource = () => {
    if (!userData) return DEFAULT_AVATARS.male;
    
    // If we have a gender-specific default avatar path
    if (userData.profilePic && typeof userData.profilePic === 'string') {
      // This assumes your backend returns paths that match your local assets
      // You might need to adjust this logic based on your actual paths
      return DEFAULT_AVATARS[userData.gender || 'male'];
    }
    
    return DEFAULT_AVATARS[userData.gender || 'male'];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="warning" size={40} color="#EF4444" />
        <Text style={styles.errorText}>Failed to load user data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6366F1" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => navigation.openDrawer()}
        >
          <Icon name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileContainer}>
          <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
            <TouchableOpacity
              onPress={() => Alert.alert('Info', 'Avatar can be changed by updating gender in profile')}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.7}
            >
              <View style={styles.avatarContainer}>
                <Image
                  source={getProfileImageSource()}
                  style={styles.avatar}
                />
                
              </View>
          
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter your age"
              placeholderTextColor="#888"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.nonEditable}>
              <Text style={styles.nonEditableText}>{userData.phoneNumber}</Text>
              <Icon name="lock-closed" size={18} color="#666" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.nonEditable}>
              <Text style={styles.nonEditableText}>
                {userData.gender?.charAt(0)?.toUpperCase() + userData.gender?.slice(1)}
              </Text>
              <Icon name="lock-closed" size={18} color="#666" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Member Since</Text>
            <View style={styles.nonEditable}>
              <Text style={styles.nonEditableText}>
                {new Date(userData.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveBtn}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={isSaving}
        >
          <View style={styles.solidBtn}>
            {isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.saveText}>Save Changes</Text>
                <Icon name="checkmark-circle" size={20} color="#FFF" />
              </>
            )}
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    marginTop: 10,
    color: '#EF4444',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: StatusBar.currentHeight + 10,
  },
  headerTitle: {
    color: '#black',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuButton: {
    backgroundColor: '#4F46E5',
    color: '#fff',
    borderRadius: 50,
    padding: 8,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#4F46E5',
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#6366F1',
    borderRadius: 15,
    padding: 5,
  },
  editPhoto: {
    color: '#6366F1',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    color: '#333',
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F9F9F9',
    color: '#333',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  nonEditable: {
    backgroundColor: '#F9F9F9',
    padding: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  nonEditableText: {
    color: '#666',
    fontSize: 16,
  },
  saveBtn: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 10,
  },
  solidBtn: {
    backgroundColor: '#4F46E5',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
});

export default SettingsScreen;