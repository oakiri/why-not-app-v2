import React, { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import CartScreen from '../../src/screens/client/CartScreen';

export default function CartTab() {
  useFocusEffect(
    useCallback(() => {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log('Navigated to Cart tab');
      }
    }, []),
  );

  return <CartScreen />;
}
