import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Linking, Platform } from 'react-native';
const HelpScreen = () => {
  const navigation = useNavigation();
  const openEmailSupport = async () => {
    const email = 'isprvm@gmail.com';
    const subject = 'Support Request';
    const body = 'Hello Support Team,\n\n I need some help regarding your RVM machine.';
    
    // Try Gmail app first on Android
    if (Platform.OS === 'android') {
      try {
        const gmailUrl = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        const supported = await Linking.canOpenURL(gmailUrl);
        
        if (supported) {
          await Linking.openURL(gmailUrl);
          return;
        }
      } catch (e) {
        console.log('Gmail app not available');
      }
    }
  
    // Fallback to standard mailto
    try {
      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      await Linking.openURL(mailtoUrl);
    } catch (error) {
      // Final fallback - open webmail
      Alert.alert(
        'Open Webmail',
        'No email app found. Would you like to open Gmail in your browser?',
        [
          {
            text: 'Open Browser',
            onPress: () => Linking.openURL(`https://mail.google.com/mail/?view=cm&to=${email}`)
          },
          {
            text: 'Copy Email',
            onPress: () => {
              Clipboard.setString(email);
              Alert.alert('Email Copied!', `${email} is ready to paste`);
            }
          },
          { text: 'Cancel' }
        ]
      );
    }
  };
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4F46E5" barStyle="light-content" />
      
      {/* Header with Menu Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => navigation.openDrawer()}
        >
          <Icon name="menu" size={28} style={styles.menuButton} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 28 }} /> {/* Spacer for balance */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <View style={styles.iconHeading}>
            <Icon name="refresh-circle" size={24} color="#4F46E5" />
            <Text style={styles.heading}> How to Use the Machine</Text>
          </View>
          <Text style={styles.text}>
            1. Open the reverse vending machine slot.{'\n'}
            2. Insert empty plastic bottles or aluminum cans.{'\n'}
            3. Wait for confirmation beep or LED light.{'\n'}
            4. Check your points in the app Dashboard.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.iconHeading}>
            <Icon name="alert-circle" size={24} color="#4F46E5" />
            <Text style={styles.heading}> Machine Not Working?</Text>
          </View>
          <Text style={styles.text}>
            - Ensure the power cable is connected securely.{'\n'}
            - Press the reset button on the side of the machine.{'\n'}
            - If still unresponsive, report the issue below.
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.iconHeading}>
            <Icon name="help-circle" size={24} color="#4F46E5" />
            <Text style={styles.heading}> Common FAQs</Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What kind of bottles can I insert?</Text>
            <Text style={styles.faqAnswer}>Clean plastic bottles and cans only.</Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Do I need internet?</Text>
            <Text style={styles.faqAnswer}>Yes, to sync your points with the app.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.iconHeading}>
            <Icon name="headset" size={24} color="#4F46E5" />
            <Text style={styles.heading}> Contact Support</Text>
          </View>
          <TouchableOpacity style={styles.button}
          onPress={openEmailSupport}
          >
            <Icon name="mail" size={20} color="#fff" />
            <Text style={styles.buttonText}> Email Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
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
    padding: 5,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  iconHeading: {
  
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  heading: {
    fontSize: 18,
    color: '#1E293B',
    fontWeight: '600',
  },
  text: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
    paddingLeft: 30, // Align with icon
  },
  faqItem: {
    marginBottom: 15,
    paddingLeft: 30,
  },
  faqQuestion: {
    color: '#1E293B',
    fontWeight: '500',
    marginBottom: 3,
  },
  faqAnswer: {
    color: '#64748B',
    fontStyle: 'italic',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#4F46E5',
    padding: 15,
    marginTop: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HelpScreen;