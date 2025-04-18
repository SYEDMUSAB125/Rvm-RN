import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';

const PointsNotification = ({ currentPoints, pointsEarned }) => {
  const showPointsDialog = () => {
    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: 'Points Earned!',
      textBody: `You've earned ${pointsEarned} points! Your total is now ${currentPoints + pointsEarned}.`,
      button: 'Got it',
    });
  };

  const showPointsToast = () => {
    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: '+ Points',
      textBody: `+${pointsEarned} points added to your account`,
      autoClose: 2500, // closes after 2.5 seconds
    });
  };

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <Text style={styles.pointsText}>Current Points: {currentPoints}</Text>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Show Points Dialog"
            onPress={showPointsDialog}
            color="#4CAF50"
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            title="Show Points Toast"
            onPress={showPointsToast}
            color="#2196F3"
          />
        </View>
      </View>
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 20,
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginVertical: 10,
  },
});

export default PointsNotification;