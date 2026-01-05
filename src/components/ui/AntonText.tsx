import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface AntonTextProps extends TextProps {
  children: React.ReactNode;
}

const AntonText: React.FC<AntonTextProps> = ({ style, children, ...props }) => {
  return (
    <Text style={[styles.antonFont, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  antonFont: {
    fontFamily: 'Anton',
  },
});

export default AntonText;
