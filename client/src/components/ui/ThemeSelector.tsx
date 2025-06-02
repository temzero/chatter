import { useThemeStore } from '@/stores/themeStore';

const ThemeSelector = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  
  const getButtonClass = (value: string) =>
    `flex items-center gap-1 px-2 py-1 w-full justify-center transition-opacity cursor-pointer 
     ${theme === value ? 'opacity-100 bg-[var(--primary-green)]' : 'opacity-30'} hover:opacity-80`;

  return (
    <div id="theme-switcher" className="flex overflow-hidden">
      <button 
        className={getButtonClass('light')} 
        onClick={() => setTheme('light')}
        aria-label="Light theme"
      >
        Light
        <i className="material-symbols-outlined">light_mode</i>
      </button>

      <button 
        className={getButtonClass('dark')} 
        onClick={() => setTheme('dark')}
        aria-label="Dark theme"
      >
        Dark
        <i className="material-symbols-outlined">dark_mode</i>
      </button>

      <button 
        className={getButtonClass('auto')} 
        onClick={() => setTheme('auto')}
        aria-label="System preference"
      >
        System
        <i className="material-symbols-outlined">routine</i>
      </button>
    </div>
  );
};

export default ThemeSelector;