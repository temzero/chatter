import React from "react";
import { motion } from "framer-motion";

// Animation variants
const sliderVariants = {
  incoming: (direction: number) => ({
    x: direction > 0 ? "200%" : "-200%",
    scale: 0.4,
    opacity: 0,
  }),
  active: {
    x: 0,
    scale: 1,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-200%" : "200%",
    scale: 0.4,
    opacity: 0,
  }),
};

const sliderTransition = {
  duration: 0.3,
  ease: [0.56, 0.03, 0.12, 1.04],
};

interface SlidingContainerProps {
  children: React.ReactNode;
  direction: number;
  uniqueKey: React.Key; // Key to trigger animation change
  className?: string;
}

export const MediaViewerSlidingContainer: React.FC<SlidingContainerProps> = ({
  children,
  direction,
  uniqueKey,
  className = "",
}) => {
  return (
    // <AnimatePresence initial={false} custom={direction}>
      <motion.div
        key={uniqueKey}
        custom={direction}
        variants={sliderVariants}
        initial="incoming"
        animate="active"
        exit="exit"
        transition={sliderTransition}
        className={`${className}`}
      >
        {children}
      </motion.div>
    // </AnimatePresence>
  );
};
