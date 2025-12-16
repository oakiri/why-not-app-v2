import React, { useEffect } from 'react';
import CartScreen from '../src/screens/client/CartScreen';

export default function CartRoute() {
  useEffect(() => {
    console.log('[NAV] Entered route: /cart');
  }, []);

  return <CartScreen />;
}
