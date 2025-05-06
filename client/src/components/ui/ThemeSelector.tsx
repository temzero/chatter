import { useThemeStore } from '@/stores/themeStore';

const ThemeSelector = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  
  const getButtonClass = (value: string) =>
    `flex items-center gap-2 px-2 py-1 justify-center rounded-full transition-opacity cursor-pointer 
     ${theme === value ? 'opacity-100' : 'opacity-30'} hover:opacity-80`;

  return (
    <div id="theme-switcher" className="flex overflow-hidden rounded-full gap-1">
      <button 
        className={getButtonClass('light')} 
        onClick={() => setTheme('light')}
        aria-label="Light theme"
      >
        <i className="material-symbols-outlined">light_mode</i>
      </button>

      <button 
        className={getButtonClass('dark')} 
        onClick={() => setTheme('dark')}
        aria-label="Dark theme"
      >
        <i className="material-symbols-outlined">dark_mode</i>
      </button>

      <button 
        className={getButtonClass('auto')} 
        onClick={() => setTheme('auto')}
        aria-label="System preference"
      >
        <i className="material-symbols-outlined">routine</i>
      </button>
    </div>
  );
};

export default ThemeSelector;