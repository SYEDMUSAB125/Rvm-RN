
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator,
  RefreshControl, 
  ScrollView,
  Dimensions,
  BackHandler ,
  Alert
} from 'react-native';
import RecyclingIcon from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contextApi/auth';
import AwesomeAlert from 'react-native-awesome-alerts';
import { getRecycledetails } from '../contextApi/profileApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // Added import
const { width ,height } = Dimensions.get('window');
const Dashboard = () => {
  const navigation = useNavigation();
  const { recycleDetails } = useAuth();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(300); // Example reward threshold
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [recycleDetail, setRecycleDetail] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
const [totalBottles, setTotalBottles] = useState(0);
const [totalCups, setTotalCups] = useState(0);
const [showAlert, setShowAlert] = useState(false);
const isInitialRender = useRef(true);


  const calculateTotalsFromHistory = (history) => {
    let points = 0;
    let bottles = 0;
    let cups = 0;
  
    history.forEach(item => {
      const session = item.recyclingSessions;
      points += session?.points || 0;
      bottles += session?.bottles || 0;
      cups += session?.cups || 0;
    });
  
    return { points, bottles, cups };
  };


  // useFocusEffect(
  //   useCallback(() => {
  //     const backHandler = BackHandler.addEventListener(
  //       'hardwareBackPress',
  //       () => {
  //         if (showAlert) {
  //           setShowAlert(false);
  //           return true;
  //         }
  //         if (showNotificationModal) {
  //           setShowNotificationModal(false);
  //           return true;
  //         }
  //         return false;
  //       }
  //     );
  
  //     return () => backHandler.remove(); // Correct cleanup
  //   }, [showAlert, showNotificationModal])
  // );



  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Load user details
      const jsonValue = await AsyncStorage.getItem('userDetails');
      let parsedUserDetails = null;
      let phoneNumberToUse = null;
  
      if (jsonValue) {
        parsedUserDetails = JSON.parse(jsonValue);
        setUserDetails(parsedUserDetails);
        phoneNumberToUse = parsedUserDetails.phoneNumber;
      } else {
        // Use recycleDetails if AsyncStorage is empty
        setUserDetails(recycleDetails);
        phoneNumberToUse = recycleDetails?.phoneNumber;
      }
  
      // 2. Fetch recycling data
      const recycleResponse = await getRecycledetails(phoneNumberToUse);
     
      
      if (recycleResponse.status !== 200) {
        throw new Error(recycleResponse.message || 'Failed to fetch recycling data');
      }
      
      setRecycleDetail(recycleResponse.data);
  
      // Update phone number from recycleResponse if we didn't have one before
      if (!phoneNumberToUse && recycleResponse.data?.phoneNumber) {
        phoneNumberToUse = recycleResponse.data.phoneNumber;
      }
  
      // Final fallback to recycleDetails if still no phone number
      if (!phoneNumberToUse && recycleDetails?.phoneNumber) {
        phoneNumberToUse = recycleDetails.phoneNumber;
      }
  
      if (phoneNumberToUse) {
        const historyResponse = await fetchHistoryData(phoneNumberToUse);
  
        setHistoryData(historyResponse);
        
        // Calculate totals from history
        const { points, bottles, cups } = calculateTotalsFromHistory(historyResponse);
        setTotalPoints(points);
        setTotalBottles(bottles);
        setTotalCups(cups);
      } else {
        console.warn("No phone number available to fetch history");
        setHistoryData([]);
        // Reset totals if no history
        setTotalPoints(0);
        setTotalBottles(0);
        setTotalCups(0);
      }
      
    } catch (err) {
      console.error('Dashboard data error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  
    
   
  const fetchHistoryData = async (phoneNumber) => {
  
    try {
 
      const response = await fetch(`https://rvm-backend.vercel.app/newgethistory/${phoneNumber}`);
      if (!response.ok) throw new Error('History fetch failed');
      const data = await response.json();
  
      return data || []; // Assuming your API returns { history: [...] }
    } catch (err) {
      console.error('History fetch error:', err);
      return []; // Return empty array if history fails
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();

  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Calculate points from either context or local state
  const circularPoints = totalPoints || 0;

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
  
    if (circularPoints >= rewardPoints) {
      setShowAlert(true);
      setHasNewNotification(true);
      setRewardPoints(rewardPoints + 100);
    }
  }, [circularPoints, rewardPoints]);


  const toggleNotificationModal = () => {
    setShowNotificationModal(!showNotificationModal);
    if (hasNewNotification) setHasNewNotification(false);
  };

  if (loading && !refreshing) {

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }



  return (
    <>
     <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title="Reward Unlocked!"
        message={`Congratulations🎉! You've earned ${totalPoints} points. Keep going!`}
        closeOnTouchOutside={true}
closeOnHardwareBackPress={false}
        showCancelButton={false}
        showConfirmButton={true}
        confirmText="Got it"
        confirmButtonColor="#4F46E5"
        onConfirmPressed={() => {
          setShowAlert(false);
          this.hideAlert();
        }}
        onCancelPressed={() => {
          this.hideAlert();
        }}
        titleStyle={styles.alertTitle}
        messageStyle={styles.alertMessage}
        contentContainerStyle={styles.alertContainer}
        confirmButtonStyle={styles.largeConfirmButton} // Add this prop
        confirmButtonTextStyle={styles.largeConfirmButtonText} // Add this prop
      />
    <ScrollView 
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['rgba(30, 27, 75, 0.7)']}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton} 
          onPress={() => navigation.openDrawer()}
        >
          <Icon name="menu" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Points</Text>

        <TouchableOpacity 
          style={styles.notificationButton} 
          onPress={toggleNotificationModal}
        >
          <Icon 
            name={hasNewNotification ? "notifications" : "notifications-outline"} 
            size={24} 
            color={hasNewNotification ? "#FFD700" : "#fff"} 
          />
          {hasNewNotification && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

      {/* Points Card */}
      <View style={styles.pointsCard}>
  <View style={styles.pointsInfo}>
    <Text style={styles.pointsLabel}>Total Points</Text>
    <Text style={styles.pointsValue}>{totalPoints}</Text>
    <View style={styles.totalsContainer}>
      <View style={styles.totalItem}>
        <Icon name="water" size={16} color="#E0E7FF" />
        <Text style={styles.totalText}>{totalBottles}</Text>
      </View>
      <View style={styles.totalItem}>
        <Icon name="cafe" size={16} color="#E0E7FF" />
        <Text style={styles.totalText}>{totalCups}</Text>
      </View>
    </View>
    <TouchableOpacity 
      style={styles.redeemButton}
      onPress={()=>{
        Alert.alert(
          "This feature is not available yet",
          "Are you sure you want to redeem your points?",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            { text: "OK" }
          ]
        );
      }}
    >
      <Text style={styles.redeemText}>Redeem Points</Text>
    </TouchableOpacity>
  </View>
  <View style={styles.circularPoints}>
    <Text style={styles.circularNumber}>{`${circularPoints}/${rewardPoints}`}</Text>
  </View>
</View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
  <View style={styles.statCard}>
    <View style={styles.statIconContainer}>
      <Icon name="water" size={24} color="#4F46E5" />
    </View>
    <Text style={styles.statCount}>{totalBottles}</Text>
    <Text style={styles.statLabel}>Total Bottles</Text>
  </View>
  
  <View style={styles.statCard}>
    <View style={styles.statIconContainer}>
      <Icon name="cafe" size={24} color="#4F46E5" />
    </View>
    <Text style={styles.statCount}>{totalCups}</Text>
    <Text style={styles.statLabel}>Total Cups</Text>
  </View>
</View>

      {/* History Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recycling History</Text>
        
        {historyData.length > 0 ? (
          <FlatList
            data={historyData}
            scrollEnabled={false}
            keyExtractor={(item, index) => item.recyclingSessions?.recycledAt || `item-${index}`}
            renderItem={({ item }) => {
              const session = item.recyclingSessions;
              return (
                <View style={styles.historyItem}>
                  <View style={styles.historyItemLeft}>
                    <View style={styles.sessionIcon}>
                      <RecyclingIcon name="recycling" size={20} color="#10B981" />
                    </View>
                    <View style={styles.historyDetails}>
                      <Text style={styles.sessionTitle}>Recycling Session</Text>
                      <View style={styles.sessionMeta}>
                        <View style={styles.metaItem}>
                          <Icon name="calendar" size={12} color="#6B7280" />
                          <Text style={styles.metaText}>
                            {new Date(session.recycledAt).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Icon name="time" size={12} color="#6B7280" />
                          <Text style={styles.metaText}>
                            {new Date(session.recycledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.historyStats}>
                    <View style={styles.statBadge}>
                      <Icon name="water" size={14} color="#3B82F6" />
                      <Text style={styles.statText}>{session.bottles}</Text>
                    </View>
                    <View style={styles.statBadge}>
                      <Icon name="cafe" size={14} color="#F59E0B" />
                      <Text style={styles.statText}>{session.cups}</Text>
                    </View>
                    <View style={styles.statBadge}>
                      <Icon name="star" size={14} color="#F59E0B" />
                      <Text style={styles.statText}>{session.points}</Text>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        ) : (
          <View style={styles.emptyHistory}>
            <Icon name="receipt-outline" size={40} color="#E5E7EB" />
            <Text style={styles.emptyText}>No recycling history yet</Text>
          </View>
        )}
      </View>

      {/* Notification Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showNotificationModal}
        onRequestClose={toggleNotificationModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={toggleNotificationModal}>
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            {hasNewNotification ? (
              <View style={styles.notificationItem}>
                <View style={styles.notificationIcon}>
                  <Icon name="trophy-outline" size={24} color="#FFD700" />
                </View>
                <View style={styles.notificationText}>
                  <Text style={styles.notificationTitle}>Reward Unlocked!</Text>
                  <Text style={styles.notificationMessage}>You've reached {rewardPoints} points</Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyNotification}>
                <Icon name="notifications-off" size={40} color="#E5E7EB" />
                <Text style={styles.emptyText}>No notifications</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    color: '#4F46E5',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    color: '#EF4444',
    marginVertical: 16,
    textAlign: 'center',
    fontSize: 16,
    maxWidth: '80%',
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 25,
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 15
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  notification: {
    backgroundColor: '#4F46E5',
    padding: 8,
    borderRadius: 20,
  },
  menuButton: {
    backgroundColor: '#4F46E5',
    padding: 8,
    borderRadius: 20
  },
  notificationButton: {
    backgroundColor: '#4F46E5',
    padding: 8,
    borderRadius: 20,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
  },
  pointsCard: {
    flexDirection: 'row',
    backgroundColor: '#1E1B4B',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsInfo: {
    flex: 1,
  },
  pointsLabel: {
    color: '#E0E7FF',
    fontSize: 14,
    opacity: 0.8,
  },
  pointsValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  redeemButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  redeemText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  circularPoints: {
    backgroundColor: '#2E2C5F',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  circularNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    width: width * 0.43,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  totalsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 12,
  },
  totalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  totalText: {
    color: '#E0E7FF',
    marginLeft: 4,
    fontSize: 14,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E1B4B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E1B4B',
    marginBottom: 16,
  },
  historyItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionIcon: {
    backgroundColor: '#D1FAE5',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyDetails: {
    flex: 1,
  },
  sessionTitle: {
    fontWeight: '600',
    color: '#111827',
    fontSize: 14,
    marginBottom: 4,
  },
  sessionMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#6B7280',
  },
  historyStats: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  emptyHistory: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 8,
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '40%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E1B4B',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  notificationIcon: {
    backgroundColor: '#FEF3C7',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1E1B4B',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  alertMessage: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  alertButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  alertButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  largeConfirmButton: {
    width: '80%', // Makes button wider
    height: 50, // Makes button taller
    borderRadius: 12, // Rounded corners
    justifyContent: 'center',
    alignSelf: 'center', // Center the button
    
  },
  largeConfirmButtonText: {
    textAlign:"center",
    fontSize: 18, // Larger text
    fontWeight: '600', // Bold text
  },
  emptyNotification: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default Dashboard;