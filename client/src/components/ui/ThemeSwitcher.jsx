import { useTheme } from '@/contexts/ThemeContext';

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  const getButtonClass = (value) =>
    `flex items-center gap-2 px-2 py-1 justify-center rounded-full transition-opacity cursor-pointer 
     ${theme === value ? 'opacity-100' : 'opacity-30'} hover:opacity-80`;

  return (
    <div id="theme-switcher" className="flex overflow-hidden rounded-full gap-1">
      <a className={getButtonClass('light')} onClick={() => setTheme('light')}>
        <i className="material-symbols-outlined">light_mode</i>
      </a>

      <a className={getButtonClass('dark')} onClick={() => setTheme('dark')}>
        <i className="material-symbols-outlined">dark_mode</i>
      </a>

      <a className={getButtonClass('auto')} onClick={() => setTheme('auto')}>
        <i className="material-symbols-outlined">routine</i>
      </a>
    </div>
  );
};

export default ThemeSwitcher;
