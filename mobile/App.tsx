import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

// Store and services
import { store } from './src/store';
import { initializeDatabase } from './src/services/database';
import { initializeCulturalProtocols } from './src/services/culturalProtocols';
import { syncOfflineData } from './src/services/sync';

// Screens
import StoriesScreen from './src/screens/StoriesScreen';
import StoryReaderScreen from './src/screens/StoryReaderScreen';
import CollaborationScreen from './src/screens/CollaborationScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CulturalProtocolsScreen from './src/screens/CulturalProtocolsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

// Components
import { CulturalProtocolReminder } from './src/components/CulturalProtocolReminder';
import { OfflineIndicator } from './src/components/OfflineIndicator';
import { LoadingScreen } from './src/components/LoadingScreen';

// Types
import { RootStackParamList, MainTabParamList } from './src/types/navigation';

// Theme
import { theme } from './src/theme';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab Navigator Component
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Stories':
              iconName = focused ? '📖' : '📖';
              break;
            case 'Collaboration':
              iconName = focused ? '🤝' : '🤝';
              break;
            case 'Profile':
              iconName = focused ? '👤' : '👤';
              break;
            case 'Settings':
              iconName = focused ? '⚙️' : '⚙️';
              break;
            default:
              iconName = '📱';
          }

          return <span style={{ fontSize: size, color }}>{iconName}</span>;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Stories" 
        component={StoriesScreen}
        options={{ title: '📖 Stories' }}
      />
      <Tab.Screen 
        name="Collaboration" 
        component={CollaborationScreen}
        options={{ title: '🤝 Community' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: '👤 Profile' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: '⚙️ Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [culturalProtocolsAccepted, setCulturalProtocolsAccepted] = useState(false);

  useEffect(() => {
    initializeApp();
    setupNetworkListener();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize local database
      await initializeDatabase();
      
      // Initialize cultural protocols
      const protocolsStatus = await initializeCulturalProtocols();
      setCulturalProtocolsAccepted(protocolsStatus.accepted);
      setShowOnboarding(!protocolsStatus.onboardingComplete);
      
      // Sync offline data if online
      const netState = await NetInfo.fetch();
      if (netState.isConnected) {
        await syncOfflineData();
      }
      
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert(
        'Initialization Error',
        'There was an issue starting the app. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = !isOnline;
      const isNowOnline = state.isConnected ?? false;
      
      setIsOnline(isNowOnline);
      
      // Sync data when coming back online
      if (wasOffline && isNowOnline) {
        syncOfflineData().catch(error => {
          console.error('Error syncing offline data:', error);
        });
      }
    });

    return unsubscribe;
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setCulturalProtocolsAccepted(true);
  };

  if (isLoading) {
    return (
      <PaperProvider theme={theme}>
        <LoadingScreen message="Initializing Empathy Ledger..." />
      </PaperProvider>
    );
  }

  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <StatusBar style="dark" />
          
          {/* Offline Indicator */}
          {!isOnline && <OfflineIndicator />}
          
          {/* Cultural Protocol Reminder */}
          {culturalProtocolsAccepted && (
            <CulturalProtocolReminder />
          )}
          
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {showOnboarding ? (
              <Stack.Screen name="Onboarding">
                {(props) => (
                  <OnboardingScreen 
                    {...props} 
                    onComplete={handleOnboardingComplete}
                  />
                )}
              </Stack.Screen>
            ) : !culturalProtocolsAccepted ? (
              <Stack.Screen name="CulturalProtocols">
                {(props) => (
                  <CulturalProtocolsScreen 
                    {...props} 
                    onAccept={() => setCulturalProtocolsAccepted(true)}
                  />
                )}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen name="Main" component={MainTabNavigator} />
                <Stack.Screen name="StoryReader" component={StoryReaderScreen} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </ReduxProvider>
  );
}