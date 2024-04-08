// Apply the theme to your components:

import React from 'react';
import { useTheme } from './ThemeProvider';

const ThemeAwareComponent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div style={{ background: theme === 'light' ? '#fff' : '#333', color: theme === 'light' ? '#333' : '#fff' }}>
      This component is theme-aware.
    </div>
  );
};

export default ThemeAwareComponent;