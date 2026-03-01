import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import HomeScreen from '../screens/main/HomeScreen';
import CreateReportScreen from '../screens/main/CreateReportScreen';
import MyReportsScreen from '../screens/main/MyReportsScreen';
import AllReportsScreen from '../screens/main/AllReportsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import ReportDetailScreen from '../screens/main/ReportDetailScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import NotificationSettingsScreen from '../screens/main/NotificationSettingsScreen';
import LanguageSelectionScreen from '../screens/main/LanguageSelectionScreen';
import ChatScreen from '../screens/main/ChatScreen';
import MessagesScreen from '../screens/main/MessagesScreen';
import RewardsScreen from '../screens/main/RewardsScreen';



// Staff screens
import DashboardScreen from '../screens/staff/DashboardScreen';
import ManageReportsScreen from '../screens/staff/ManageReportsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeList" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AllReports" component={AllReportsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Report Details' }} />
    </Stack.Navigator>
  );
};

const MyReportsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MyReportsList" component={MyReportsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Report Details' }} />
    </Stack.Navigator>
  );
};

// Staff Tab Navigator
const StaffTabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'ManageReports') {
            iconName = focused ? 'file-document-multiple' : 'file-document-multiple-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface.primary,
          borderTopColor: theme.colors.border.primary,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Admin Dashboard' }} />
      <Tab.Screen name="ManageReports" component={ManageReportsScreen} options={{ title: 'Manage Reports' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

// Citizen Tab Navigator
const CitizenTabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyReports') {
            iconName = focused ? 'file-document' : 'file-document-outline';
          } else if (route.name === 'Rewards') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'message' : 'message-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }



          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface.primary,
          borderTopColor: theme.colors.border.primary,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Rewards" component={RewardsScreen} options={{ title: 'Rewards' }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ title: 'Messages' }} />
      <Tab.Screen name="MyReports" component={MyReportsStack} options={{ title: 'My Reports' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />


    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  // Check if user is staff/admin/supervisor
  const isStaff = user?.role && ['staff', 'supervisor', 'admin'].includes(user.role);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isStaff ? (
        <Stack.Screen name="StaffTabs" component={StaffTabNavigator} />
      ) : (
        <Stack.Screen name="CitizenTabs" component={CitizenTabNavigator} />
      )}

      {/* Modal Screens available to all users */}
      <Stack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{
          headerShown: true,
          title: 'Report Details',
          headerStyle: { backgroundColor: theme.colors.primary.main },
          headerTintColor: theme.colors.text.contrast,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="LanguageSelection"
        component={LanguageSelectionScreen}
        options={{
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;