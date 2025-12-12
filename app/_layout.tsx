import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from '../src/navigation/AppNavigator';

export default function RootLayout() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
