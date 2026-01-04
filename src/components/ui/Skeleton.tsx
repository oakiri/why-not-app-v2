import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const Skeleton = ({ width, height, borderRadius = 8, style }: any) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#E1E9EE',
          opacity,
        },
        style,
      ]}
    />
  );
};

export const MenuSkeleton = () => (
  <View style={styles.container}>
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={styles.card}>
        <Skeleton width={80} height={80} borderRadius={12} />
        <View style={styles.info}>
          <Skeleton width="70%" height={20} style={{ marginBottom: 8 }} />
          <Skeleton width="90%" height={15} style={{ marginBottom: 8 }} />
          <Skeleton width="30%" height={20} />
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { padding: 20 },
  card: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#FFF', borderRadius: 16, padding: 10 },
  info: { flex: 1, marginLeft: 15, justifyContent: 'center' }
});
