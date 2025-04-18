import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { checkPhoneNumberExists } from '../contextApi/userNumber';

const MobileNumberScreen = ({navigation}) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const animationRef = useRef(null);






  const validateMobileNumber = (number) => {
    const regex = /^[0-9]{10,15}$/;
    return regex.test(number);
  };

  const handleNumberChange = (text) => {
    setMobileNumber(text);
    setIsValid(validateMobileNumber(text));
  };

  // const checkNumberAvailability = async () => {
  //   if (!isValid) {
  //     Alert.alert('Invalid Number', 'Please enter a valid mobile number');
  //     return;
  //   }

  //   setIsLoading(true);
    
  //   try {
  //     // Simulate API call
  //     const response =  await checkPhoneNumberExists(mobileNumber)
  //     if(response.ok){
  //       navigation.navigate('ProfileRegistration', { mobileNumber });
  //     }
  //     else{
  //       Alert.alert('Number Not Found', 'This mobile number is not registered. Please check and try again.');
  //     }
      
  //   } catch (error) {
  //     Alert.alert('Error', 'Failed to check mobile number. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const checkNumberAvailability = async () => {
    if (!isValid) {
      Alert.alert('Invalid Number', 'Please enter a valid mobile number');
      return;
    }
  
    setIsLoading(true);
    
    try {
      const response = await checkPhoneNumberExists(mobileNumber);
      console.log("mobile number screen" , response)
      if (response.response === 200) {
        if(response.verification === 200){
        
          navigation.navigate('Home',{user : response.userDetails });
          return
        }
        // Number exists - proceed to registration
        navigation.navigate('ProfileRegistration', { mobileNumber });
      } else {
        // Number doesn't exist - show alert and let user try again
        Alert.alert(
          'Number Not Found', 
          'This mobile number is not registered. Please check and try again.',
          [
            { text: 'OK', onPress: () => setIsLoading(false) }
          ]
        );
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert(
        'Connection Error',
        'Failed to check mobile number. Please try again.',
        [
          { text: 'Retry', onPress: () => checkNumberAvailability() },
          { text: 'Cancel', onPress: () => setIsLoading(false), style: 'cancel' }
        ]
      );
    }
  };
  
    useEffect(() => {
      if (animationRef.current) {
        // Play from frame 0 to 480
        animationRef.current.play(0, 480);
      }
    }, []);

  return (
    <View style={styles.container}>
      <View style={styles.animationContainer}>
        <LottieView
          ref={animationRef}
          source={require('../assets/hello.json')}
          autoPlay
          loop={false}
          style={styles.animation}
         
       
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Enter Your Mobile Number</Text>
        <TextInput
          style={[styles.input, !isValid && mobileNumber.length > 0 && styles.invalidInput]}
          placeholder="e.g. 03234539282"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          maxLength={15}
          value={mobileNumber}
          onChangeText={handleNumberChange}
          editable={!isLoading}
        />
        
        {isLoading ? (
          <ActivityIndicator size="large" color="#6C63FF" style={styles.loader} />
        ) : (
          <TouchableOpacity
            style={[styles.button, !isValid && styles.disabledButton]}
            onPress={checkNumberAvailability}
            disabled={!isValid || isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  content: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#333',
  },
  invalidInput: {
    borderColor: '#FF6B6B',
  },
  button: {
    backgroundColor: '#6C63FF',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#C4C4C4',
    shadowColor: 'transparent',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loader: {
    marginTop: 24,
  },
});

export default MobileNumberScreen;