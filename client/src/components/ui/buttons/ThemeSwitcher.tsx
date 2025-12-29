import { motion, AnimatePresence } from "framer-motion";
import { getSetTheme, useResolvedTheme } from "@/stores/themeStore";
import { ThemeMode, ResolvedTheme } from "@/shared/types/enums/theme.enum";

const ThemeSwitcher = () => {
  const resolvedTheme = useResolvedTheme();
  const setTheme = getSetTheme();
  const toggleTheme = () => {
    setTheme(resolvedTheme === ResolvedTheme.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT);
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
        resolvedTheme === ResolvedTheme.LIGHT ? ResolvedTheme.DARK : ResolvedTheme.LIGHT
      } mode`}
      whileTap={{ scale: 0.9 }}
    >
      <div className="relative w-6 h-6">
        <AnimatePresence mode="wait">
          {resolvedTheme === ResolvedTheme.LIGHT ? (
            <motion.i
              key={ResolvedTheme.LIGHT}
              className="material-symbols-outlined filled absolute inset-0"
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
              key={ResolvedTheme.DARK}
              className="material-symbols-outlined filled absolute inset-0"
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
