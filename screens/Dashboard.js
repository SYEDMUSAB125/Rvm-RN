
import React, { useState, useEffect } from 'react';
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
  Dimensions
} from 'react-native';
import RecyclingIcon from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/Ionicons';

import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contextApi/auth';
import { ALERT_TYPE, Dialog, AlertNotificationRoot } from 'react-native-alert-notification';
import { getRecycledetails } from '../contextApi/profileApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width } = Dimensions.get('window');
const Dashboard = () => {
  const navigation = useNavigation();
  const { recycleDetails } = useAuth();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [rewardPoints, setRewardPoints] = useState(100); // Example reward threshold
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [recycleDetail, setRecycleDetail] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Load user details
      const jsonValue = await AsyncStorage.getItem('userDetails');
      if (!jsonValue) throw new Error('No user data found');
      
      const parsedUserDetails = JSON.parse(jsonValue);
      setUserDetails(parsedUserDetails);

      // 2. Fetch recycling data
      const recycleResponse = await getRecycledetails(parsedUserDetails.phoneNumber);
      console.log("the recycle response is ",recycleResponse);
      if (recycleResponse.status !== 200) {
        throw new Error(recycleResponse.message || 'Failed to fetch recycling data');
      }
      setRecycleDetail(recycleResponse.data);

      // 3. Fetch history data
      const historyResponse = await fetchHistoryData(parsedUserDetails.phoneNumber);
      console.log("the history reposne is ",historyResponse);
      setHistoryData(historyResponse);
      
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
      const response = await fetch(`http://192.168.221.252:3000/newgethistory/${phoneNumber}`);
      if (!response.ok) throw new Error('History fetch failed');
      const data = await response.json();
      console.log("the history data is ",data);
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
  const circularPoints = recycleDetails?.points || recycleDetail?.points || 0;

  // Reward notification logic
  useEffect(() => {
    if (circularPoints >= rewardPoints) {
      showRewardNotification();
      setHasNewNotification(true);
    }
  }, [circularPoints, rewardPoints]);

  const showRewardNotification = () => {
    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: 'Reward Unlocked!',
      textBody: `Congratulations! You've earned ${rewardPoints} points.`,
      button: 'Got it',
    });
  };

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

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="warning" size={40} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchAllData}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <AlertNotificationRoot>
    <ScrollView 
      style={styles.scrollContainer}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#4F46E5']}
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
          <Text style={styles.pointsValue}>{circularPoints}</Text>
          <TouchableOpacity 
            style={styles.redeemButton}
            onPress={() => navigation.navigate('Rewards')}
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
          <Text style={styles.statCount}>
            {recycleDetails?.recyclingSessions?.bottles || recycleDetail?.bottles || 0}
          </Text>
          <Text style={styles.statLabel}>Bottles</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Icon name="cafe" size={24} color="#4F46E5" />
          </View>
          <Text style={styles.statCount}>
            {recycleDetails?.cups || recycleDetail?.cups || 0}
          </Text>
          <Text style={styles.statLabel}>Cups/Cuttlery</Text>
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
                  <Icon name="trophy" size={24} color="#FFD700" />
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
  </AlertNotificationRoot>
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
    width: 70,
    height: 70,
    borderRadius: 35,
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
  emptyNotification: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default Dashboard;