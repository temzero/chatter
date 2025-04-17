import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeSwitcher = () => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  // Animation variants
  const iconVariants = {
    initial: { scale: 0.6, opacity: 0, rotate: -90 },
    animate: { scale: 1, opacity: 1, rotate: 0 },
    exit: { scale: 0.6, opacity: 0, rotate: 90 }
  };

  return (
    <div
      id="theme-switcher"
      className="flex items-center justify-center w-10 h-10 rounded-full cursor-pointer opacity-80 hover:opacity-100"
      onClick={toggleTheme}
      aria-label={`Toggle ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-6 h-6">
        <AnimatePresence mode="wait">
          {resolvedTheme === 'light' ? (
            <motion.i
              key="light"
              className="material-symbols-outlined absolute inset-0"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, type: 'spring' }}
            >
              light_mode
            </motion.i>
          ) : (
            <motion.i
              key="dark"
              className="material-symbols-outlined absolute inset-0"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, type: 'spring' }}
            >
              dark_mode
            </motion.i>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ThemeSwitcher;