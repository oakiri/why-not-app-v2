import React from 'react';
import { Linking, Pressable, Text, type ComponentProps } from 'react-native';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';

export type ExternalLinkProps = ComponentProps<typeof Pressable> & {
  href: string;
  children: React.ReactNode;
};

export function ExternalLink({ href, children, onPress, ...rest }: ExternalLinkProps) {
  return (
    <Pressable
      accessibilityRole="link"
      {...rest}
      onPress={async (event) => {
        onPress?.(event);

        if (process.env.EXPO_OS !== 'web') {
          event.preventDefault?.();
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
          return;
        }

        Linking.openURL(href);
      }}
    >
      {typeof children === 'string' ? <Text>{children}</Text> : children}
    </Pressable>
  );
}
