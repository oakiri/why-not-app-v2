import React, { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import ProfileScreen from '../../src/screens/client/ProfileScreen';

export default function ProfileTab() {
  useFocusEffect(
    useCallback(() => {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('Navigated to Profile tab');
      }
    }, []),
  );

  return <ProfileScreen />;
}
