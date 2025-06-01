import React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Animation variants with proper typing
const sliderVariants: Variants = {
  incoming: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    position: "absolute" as const,
  }),
  active: {
    x: 0,
    scale: 1,
    opacity: 1,
    position: "relative" as const,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
    position: "absolute" as const,
  }),
};

const sliderTransition = {
  duration: 0.3,
  type: "spring",
  stiffness: 300,
  damping: 20,
  mass: 0.5,
};

interface SlidingContainerProps {
  children: React.ReactNode;
  direction: number;
  uniqueKey: React.Key;
  className?: string;
}

export const SlidingContainer: React.FC<SlidingContainerProps> = ({
  children,
  direction,
  uniqueKey,
  className = "",
}) => {
  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto relative">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={uniqueKey}
          custom={direction}
          variants={sliderVariants}
          initial="incoming"
          animate="active"
          exit="exit"
          transition={sliderTransition}
          className={`w-full h-full ${className}`}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
