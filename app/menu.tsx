import React, { useEffect } from 'react';
import MenuScreen from '../src/screens/client/MenuScreen';

export default function MenuRoute() {
  useEffect(() => {
    console.log('[NAV] Entered route: /menu');
  }, []);

  return <MenuScreen />;
}
