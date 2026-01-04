import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../types';
import { COLORS } from '../constants';

// Client Screens
import MenuScreen from '../screens/client/menu/MenuScreen';
import CheckoutScreen from '../screens/client/orders/CheckoutScreen';
import OrderDetailScreen from '../screens/client/orders/OrderDetailScreen';
import ReservationFormScreen from '../screens/client/reservations/ReservationFormScreen';
import LoyaltyScreen from '../screens/client/loyalty/LoyaltyScreen';
import ProfileScreen from '../screens/client/ProfileScreen';

// Backoffice Screens
import DashboardScreen from '../screens/backoffice/dashboard/DashboardScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function ClientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Menu') iconName = focused ? 'restaurant' : 'restaurant-outline';
          else if (route.name === 'Loyalty') iconName = focused ? 'ribbon' : 'ribbon-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={MenuScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Menu" component={MenuScreen} options={{ title: 'Carta' }} />
      <Tab.Screen name="Loyalty" component={LoyaltyScreen} options={{ title: 'Puntos' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

function BackofficeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Orders') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Menu') iconName = focused ? 'restaurant' : 'restaurant-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Panel' }} />
      <Tab.Screen name="Orders" component={DashboardScreen} options={{ title: 'Pedidos' }} />
      <Tab.Screen name="Menu" component={DashboardScreen} options={{ title: 'Menú' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        user.role === 'employee' || user.role === 'admin' ? (
          <Stack.Screen name="Backoffice" component={BackofficeTabs} />
        ) : (
          <>
            <Stack.Screen name="Main" component={ClientTabs} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="ReservationForm" component={ReservationFormScreen} />
          </>
        )
      ) : (
        // Auth screens would go here
        <Stack.Screen name="Main" component={ClientTabs} />
      )}
    </Stack.Navigator>
  );
}
