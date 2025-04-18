import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('MobileNumber');
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reverse Vending Machine</Text>
        <Text style={styles.tagline}>Recycle Smart, Earn Rewards</Text>
      </View>
      
      <LottieView
        source={require('../assets/splash-animation.json')}
        autoPlay
        loop={false}
        style={styles.animation}
        resizeMode="contain"
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Loading...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B', // Primary purple
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
    padding:10
  },
  content: {
    alignItems: 'center',
    marginTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 18,
    color: '#F59E0B', // Amber accent
    fontStyle: 'italic',
    textAlign: 'center',
  },
  animation: {
    width: 300,
    height: 300,
  },
  footer: {
    paddingBottom: 30,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
});

export default SplashScreen;