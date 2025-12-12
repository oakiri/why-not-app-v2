// index.js
import { registerRootComponent } from 'expo';
import App from './App';

// Esto se asegura de que el componente App se registre como raíz,
// tanto en Expo Go como en web y builds nativos.
registerRootComponent(App);
