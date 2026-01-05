import React, { createContext, useContext } from 'react';
import { colors } from '../theme/theme';

const ThemeContext = createContext({
  colors,
  fonts: {
    primary: 'Anton',
  }
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeContext.Provider value={{ colors, fonts: { primary: 'Anton' } }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
