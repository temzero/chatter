import { MotionProps } from "framer-motion";

export const publicLayoutAnimations: Record<string, MotionProps> = {
  container: {
    initial: { scale: 1.2, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 },
  },
  mobileContainer: {
    initial: { opacity: 0, y: 300 },
    animate: { opacity: 1, y: 0 },
    transition: {
      type: "spring",
      stiffness: 250,
      damping: 25,
    },
  },
  formButton: {
    whileTap: { scale: 0.98 },
  },
};
