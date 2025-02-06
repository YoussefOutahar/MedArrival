import { useDarkMode } from '@/contexts/DarkModeContext';
import { DarkModeSwitch } from 'react-toggle-dark-mode';

export const ThemeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const handleToggle = (_checked: boolean) => {
    toggleDarkMode();
  };

  return (
    <DarkModeSwitch
      checked={isDarkMode}
      onChange={handleToggle}
      size={24}
    />
  );
};

export default ThemeToggle;