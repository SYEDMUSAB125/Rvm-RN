

// // export default App;
// import { useDrawerTheme } from '../contexts/DrawerThemeContext';
// import 'react-native-gesture-handler';
// import React, {useState, useEffect} from 'react';
// import {
//   NavigationContainer,
//   useNavigationState,
// } from '@react-navigation/native';
// import {createStackNavigator} from '@react-navigation/stack';
// import {
//   createDrawerNavigator,
//   DrawerContentScrollView,
// } from '@react-navigation/drawer';
// import {
//   View,
//   Image,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Switch,
//   ActivityIndicator,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import {AuthProvider, useAuth} from './contextApi/auth';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// // Screens
// import MobileNumberScreen from './screens/MobileNumberScreen';
// import ProfileRegistration from './screens/ProfileRegistration';
// import Dashboard from './screens/Dashboard';
// import Settings from './screens/Settings';
// import Logout from './screens/Logout';
// import Help from './screens/Help';
// import SplashScreen from './screens/SplashScreen';
// import SecondProfile from './screens/SecondProfile';
// import { DrawerThemeProvider } from './contexts/DrawerThemeContext';
// const Stack = createStackNavigator();
// const Drawer = createDrawerNavigator();


// const DEFAULT_AVATARS = {
//   male: require('./assets/images/male-avatar.png'),
//   female: require('./assets/images/female-avatar.png'),
//   other: require('./assets/images/neutral-avatar.png')
// };

// const CustomDrawerContent = ({ navigation, state }) => {
//   const { user, logout } = useAuth();
//   const { darkMode, toggleDarkMode } = useDrawerTheme(); // Use drawer theme
//   const [userDetails, setUserDetails] = useState(null);

//   const currentRoute = state.routeNames[state.index];

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const jsonValue = await AsyncStorage.getItem('userDetails');
//         if (jsonValue !== null) {
//           setUserDetails(JSON.parse(jsonValue));
//         }
//       } catch (error) {
//         console.error('Failed to load user data:', error);
//       }
//     };

//     fetchUserData();
//   }, []);

//   const getProfileImageSource = () => {
//     if (user?.profilePic) return { uri: user.profilePic };
//     if (userDetails?.profilePic) return { uri: userDetails.profilePic };
    
//     // Use gender-specific default avatar if available
//     const gender = user?.gender || userDetails?.gender || 'male';
//     return DEFAULT_AVATARS[gender.toLowerCase()] || DEFAULT_AVATARS.male;
//   };

//   const handleNavigation = (screen) => {
//     if (screen === 'Logout') {
//       logout();
//     } else {
//       navigation.navigate(screen);
//     }
//   };

//   const menuItems = [
//     { label: 'Dashboard', icon: 'dashboard', screen: 'Dashboard' },
//     { label: 'Settings', icon: 'settings', screen: 'Settings' },
//     { label: 'Help', icon: 'help', screen: 'Help' },
//     { label: 'Logout', icon: 'logout', screen: 'Logout' },
//   ];

//   return (
//     <DrawerContentScrollView 
//       contentContainerStyle={[
//         styles.scrollContainer,
//         darkMode && styles.darkScrollContainer
//       ]}
//     >
//       <View style={[
//         styles.container,
//         darkMode && styles.darkContainer
//       ]}>
//         {/* Profile Image */}
//         <Image
//           source={getProfileImageSource()}
//           style={styles.profileImage}
//         />
        
//         {/* Name and Phone - add dark mode text styles */}
//         <Text style={[styles.name, darkMode && styles.darkText]}>
//           {user?.username || userDetails?.username || 'Guest User'}
//         </Text>
//         <Text style={[styles.phone, darkMode && styles.darkSubText]}>
//           {user?.phoneNumber || userDetails?.phoneNumber || ''}
//         </Text>

//         {/* Menu Items */}
//         <View style={styles.menuContainer}>
//           {menuItems.map((item) => (
//             <TouchableOpacity
//               key={item.label}
//               onPress={() => handleNavigation(item.screen)}
//               style={[
//                 styles.menuItem,
//                 currentRoute === item.screen && styles.activeItem,
//                 darkMode && styles.darkMenuItem
//               ]}
//             >
//               <Icon
//                 name={item.icon}
//                 size={24}
//                 color={currentRoute === item.screen ? '#4F46E5' : (darkMode ? '#E2E8F0' : '#64748B')}
//               />
//               <Text
//                 style={[
//                   styles.menuText,
//                   currentRoute === item.screen && styles.activeText,
//                   darkMode && styles.darkMenuText
//                 ]}
//               >
//                 {item.label}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>

//         {/* Dark Mode Switch */}
//         <View style={[styles.footer, darkMode && styles.darkFooter]}>
//           <Text style={[styles.themeText, darkMode && styles.darkText]}>Dark Mode</Text>
//           <Switch
//             value={darkMode}
//             onValueChange={toggleDarkMode} // Use the context toggle
//             trackColor={{ false: '#E2E8F0', true: '#4F46E5' }}
//             thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
//           />
//         </View>
//       </View>
//     </DrawerContentScrollView>
//   );
// };
// // Drawer Navigator
// const DrawerNavigator = () => {
//   return (
//     <DrawerThemeProvider>
//     <Drawer.Navigator
//         drawerContent={props => <CustomDrawerContent {...props} />}
//         screenOptions={{
//           headerShown: false,
//           drawerType: 'slide',
//           overlayColor: 'transparent',
//           drawerStyle: styles.drawerStyles,
//         }}>
//       <Drawer.Screen name="Dashboard" component={Dashboard} />
//       <Drawer.Screen name="Settings" component={Settings} />
//       <Drawer.Screen name="Help" component={Help} />
//       <Drawer.Screen name="Logout" component={Logout} />
//     </Drawer.Navigator>
//     </DrawerThemeProvider>
//   );
// };

// // Main App Component with Auth Flow
// const App = () => {
//   const [appReady, setAppReady] = useState(false);
//   const {user, status} = useAuth();

//   useEffect(() => {
//     // Simulate app loading
//     const timer = setTimeout(() => setAppReady(true), 2000);
//     return () => clearTimeout(timer);
//   }, []);

//   if (!appReady) {
//     return <SplashScreen />;
//   }

//   return (
//     <NavigationContainer>
//       <Stack.Navigator screenOptions={{headerShown: false}}>
//         <Stack.Screen name="MobileNumber" component={MobileNumberScreen} />
//         <Stack.Screen
//           name="ProfileRegistration"
//           component={SecondProfile}
//           options={{gestureEnabled: false}}
//         />
//         <Stack.Screen
//           name="Home"
//           component={DrawerNavigator}
//           options={{gestureEnabled: false}}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };

// // Wrap the app with AuthProvider
// export default () => (
//   <AuthProvider>
//     <App />
//   </AuthProvider>
// );

// // Enhanced Styles
// const styles = StyleSheet.create({
//   scrollContainer:{
//     flex: 1,
//   },
//   container: {
//     padding: 20,
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   drawerStyles: {
//     width: '70%',
//     backgroundColor: 'transparent',
//   },
//   profileImage: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     alignSelf: 'center',
//     borderWidth: 2,
//     borderColor: '#4F46E5',
//   },
//   name: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginTop: 10,
//     color: '#333',
//   },
//   darkContainer: {
//     backgroundColor: '#1E293B',
//   },
//   darkText: {
//     color: '#F8FAFC',
//   },
//   darkSubText: {
//     color: '#94A3B8',
//   },
//   darkMenuItem: {
//     backgroundColor: '#334155',
//   },
//   darkMenuText: {
//     color: '#E2E8F0',
//   },
//   darkFooter: {
//     borderTopColor: '#334155',
//   },
//   darkScrollContainer: {
//     backgroundColor: '#1E293B',
//   },
//   role: {
//     fontSize: 14,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   menuItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 15,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   activeItem: {
//     backgroundColor: '#EDE9FE',
//   },
//   menuText: {
//     marginLeft: 15,
//     fontSize: 16,
//     color: '#333',
//   },
//   footer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginTop: 'auto',
//     paddingTop: 20,
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//   },
// });




import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import {
  CommonActions,
  NavigationContainer,
  useNavigationState,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AuthProvider, useAuth } from './contextApi/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Screens
import MobileNumberScreen from './screens/MobileNumberScreen';
import Dashboard from './screens/Dashboard';
import Settings from './screens/Settings';
import Logout from './screens/Logout';
import Help from './screens/Help';
import SplashScreen from './screens/SplashScreen';
import SecondProfile from './screens/SecondProfile';
import { useDrawerTheme,DrawerThemeProvider } from './contextApi/DrawerThemeContext ';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const DEFAULT_AVATARS = {
  male: require('./assets/images/male-avatar.png'),
  female: require('./assets/images/female-avatar.png'),
  other: require('./assets/images/neutral-avatar.png')
};

const CustomDrawerContent = ({ navigation, state }) => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useDrawerTheme();
  const [userDetails, setUserDetails] = useState(null);

  const currentRoute = state.routeNames[state.index];
  const logout = () => {
    // 1. Show confirmation dialog
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => performLogout(),
        },
      ]
    );
  };
  
  
  const performLogout = () => {
    try {
      // 3. Reset navigation stack
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'MobileNumber' }, // Replace with your initial auth screen
          ],
        })
      );
  
      // 4. Close the drawer if open
      navigation.closeDrawer();
  
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('userDetails');
        if (jsonValue !== null) {
          setUserDetails(JSON.parse(jsonValue));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    };

    fetchUserData();
  }, []);
console.log("thr user details",userDetails)
  const getProfileImageSource = () => {
    if (user?.profilePic) return { uri: user.profilePic };
    if (userDetails?.profilePic) return { uri: userDetails.profilePic };
    
    const gender = user?.gender || userDetails?.gender || 'male';
    const normalizedGender = gender.toLowerCase();
    
    if (DEFAULT_AVATARS[normalizedGender]) {
      return DEFAULT_AVATARS[normalizedGender];
    }
    
    return DEFAULT_AVATARS.male;
  };

  const handleNavigation = (screen) => {
    if (screen === 'Logout') {
      logout();
    } else {
      navigation.navigate(screen);
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: 'dashboard', screen: 'Dashboard' },
    { label: 'Settings', icon: 'settings', screen: 'Settings' },
    { label: 'Help', icon: 'help', screen: 'Help' },
    { label: 'Logout', icon: 'logout', screen: 'Logout' },
  ];

  return (
    <DrawerContentScrollView 
      contentContainerStyle={[
        styles.scrollContainer,
        darkMode && styles.darkScrollContainer
      ]}
    >
      <View style={[
        styles.container,
        darkMode && styles.darkContainer
      ]}>
        <Image
          source={getProfileImageSource()}
          style={styles.profileImage}
        />
        <Text style={[styles.name, darkMode && styles.darkText]}>
          {user?.username || userDetails?.username || 'Guest User'}
        </Text>
        <Text style={[styles.phone, darkMode && styles.darkSubText]}>
          {user?.phoneNumber || userDetails?.phoneNumber || ''}
        </Text>

        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              onPress={() => handleNavigation(item.screen)}
              style={[
                styles.menuItem,
                currentRoute === item.screen && styles.activeItem,
                darkMode && styles.darkMenuItem
              ]}
            >
              <Icon
                name={item.icon}
                size={24}
                color={currentRoute === item.screen ? '#4F46E5' : (darkMode ? '#E2E8F0' : '#64748B')}
              />
              <Text
                style={[
                  styles.menuText,
                  currentRoute === item.screen && styles.activeText,
                  darkMode && styles.darkMenuText
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.footer, darkMode && styles.darkFooter]}>
          <Text style={[styles.themeText, darkMode && styles.darkText]}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#E2E8F0', true: '#4F46E5' }}
            thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => {
  return (
    <DrawerThemeProvider>
      <Drawer.Navigator
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: 'slide',
          overlayColor: 'transparent',
          drawerStyle: styles.drawerStyles,
        }}
      >
        <Drawer.Screen name="Dashboard" component={Dashboard} />
        <Drawer.Screen name="Settings" component={Settings} />
        <Drawer.Screen name="Help" component={Help} />
        <Drawer.Screen name="Logout" component={Logout} />
      </Drawer.Navigator>
    </DrawerThemeProvider>
  );
};

const App = () => {
  const [appReady, setAppReady] = useState(false);
  const { user, status } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setAppReady(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!appReady) {
    return <SplashScreen />;
  }

  return (
        <NavigationContainer>
          <Stack.Navigator screenOptions={{headerShown: false}}>
            <Stack.Screen name="MobileNumber" component={MobileNumberScreen} />
            <Stack.Screen
              name="ProfileRegistration"
              component={SecondProfile}
              options={{gestureEnabled: false}}
            />
            <Stack.Screen
              name="Home"
              component={DrawerNavigator}
              options={{gestureEnabled: false}}
            />
          </Stack.Navigator>
        </NavigationContainer>
      );
    };

export default () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#1E293B',
  },
  darkText: {
    color: '#F8FAFC',
  },
  darkSubText: {
    color: '#94A3B8',
  },
  darkMenuItem: {
    backgroundColor: '#334155',
  },
  darkMenuText: {
    color: '#E2E8F0',
  },
  darkFooter: {
    borderTopColor: '#334155',
  },
  darkScrollContainer: {
    backgroundColor: '#1E293B',
  },
  drawerStyles: {
    width: '70%',
    backgroundColor: 'transparent',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    color: '#333',
  },
  phone: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  activeItem: {
    backgroundColor: '#EDE9FE',
  },
  activeText: {
    color: '#4F46E5',
    fontWeight: 'bold',
  },
  menuText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  themeText: {
    fontSize: 16,
  },
});