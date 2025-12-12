import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Image } from 'react-native';

export default function AuthLayout({ children }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}
        >
          <Image
            source={require('../../../assets/logo.png')}
            style={{
              width: 160,
              height: 160,
              resizeMode: 'contain',
              marginBottom: 24,
            }}
          />
          {children}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
