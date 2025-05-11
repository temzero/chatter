import React from "react";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const sliderVariants = {
  incoming: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    scale: 0.4,
    opacity: 0,
    position: "absolute",
  }),
  active: {
    x: 0,
    scale: 1,
    opacity: 1,
    position: "relative",
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    scale: 0.4,
    opacity: 0,
    position: "absolute",
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

export const MediaSlidingContainer: React.FC<SlidingContainerProps> = ({
  children,
  direction,
  uniqueKey,
  className = "",
}) => {
  return (
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
  );
};
