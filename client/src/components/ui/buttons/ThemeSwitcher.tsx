import { motion, AnimatePresence } from "framer-motion";
import { Theme, ThemeOption, getSetTheme, useTheme } from "@/stores/themeStore";

const ThemeSwitcher = () => {
  const theme = useTheme();
  const setTheme = getSetTheme();
  const toggleTheme = () => {
    setTheme(theme === Theme.Light ? ThemeOption.Dark : ThemeOption.Light);
  };

  // Animation variants
  const iconVariants = {
    initial: { scale: 0.6, opacity: 0, rotate: -90 },
    animate: { scale: 1, opacity: 1, rotate: 0 },
    exit: { scale: 0.6, opacity: 0, rotate: 90 },
  };

  return (
    <motion.div
      id="theme-switcher"
      className="flex items-center justify-center w-10 h-10 rounded-full! cursor-pointer opacity-80 hover:opacity-100"
      onClick={toggleTheme}
      aria-label={`Toggle ${
        theme === Theme.Light ? Theme.Dark : Theme.Light
      } mode`}
      whileTap={{ scale: 0.9 }}
    >
      <div className="relative w-6 h-6">
        <AnimatePresence mode="wait">
          {theme === Theme.Light ? (
            <motion.i
              key={Theme.Light}
              className="material-symbols-outlined absolute inset-0"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, type: "spring" }}
            >
              light_mode
            </motion.i>
          ) : (
            <motion.i
              key={Theme.Dark}
              className="material-symbols-outlined absolute inset-0"
              variants={iconVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, type: "spring" }}
            >
              dark_mode
            </motion.i>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ThemeSwitcher;
