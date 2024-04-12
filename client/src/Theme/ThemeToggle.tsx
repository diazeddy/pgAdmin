import React from 'react';

interface Props {
  theme: string;
  toggleTheme: (_: string) => void;
}

const ThemeToggle: React.FC<Props> = ({ theme, toggleTheme }) => {
  return (
    <button onClick={() => toggleTheme(theme === 'light' ? 'dark' : 'light')}>
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
    </button>
  );
};

export default ThemeToggle;