import React, { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import MenuScreen from '../../src/screens/client/MenuScreen';

export default function MenuTab() {
  useFocusEffect(
    useCallback(() => {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('Navigated to Menu tab');
      }
    }, []),
  );

  return <MenuScreen />;
}
