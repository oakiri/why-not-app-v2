import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme/theme';

export default function BackofficeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#000',
        },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontFamily: 'Anton',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="dashboard/index" options={{ title: 'DASHBOARD' }} />
      <Stack.Screen name="menu/index" options={{ title: 'GESTIÓN MENÚ' }} />
      <Stack.Screen name="orders/index" options={{ title: 'PEDIDOS' }} />
      <Stack.Screen name="employees/index" options={{ title: 'EQUIPO' }} />
      <Stack.Screen name="reservations/index" options={{ title: 'RESERVAS' }} />
    </Stack>
  );
}
