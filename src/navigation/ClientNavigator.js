import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MenuScreen from '../screens/client/MenuScreen';
import CartScreen from '../screens/client/CartScreen';
import ProfileScreen from '../screens/client/ProfileScreen';

const Tab = createBottomTabNavigator();

const ClientNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#f9d648',
      tabBarInactiveTintColor: '#d7d7d7',
      tabBarStyle: { backgroundColor: '#0b0b0b' },
      tabBarIcon: ({ color, size }) => {
        let iconName = 'list';
        if (route.name === 'Menu') iconName = 'fast-food';
        if (route.name === 'Cart') iconName = 'cart';
        if (route.name === 'Profile') iconName = 'person';
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Menu" component={MenuScreen} />
    <Tab.Screen name="Cart" component={CartScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default ClientNavigator;
