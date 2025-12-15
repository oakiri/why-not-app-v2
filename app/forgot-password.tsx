import React, { useEffect } from 'react';
import ForgotPasswordScreen from '../src/screens/auth/ForgotPasswordScreen';

export default function ForgotPassword() {
useEffect(() => {
console.log('[AUTH] Entered route: /forgot-password');
}, []);

return <ForgotPasswordScreen />;
}
