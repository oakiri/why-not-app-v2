import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import ClientNavigator from './ClientNavigator';
import AuthNavigator from './AuthNavigator';
import useAuth from '../hooks/useAuth';

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
      </View>
    );
  }

  if (!user) {
    return <AuthNavigator />;
  }

  return <ClientNavigator />;
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD600',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});
