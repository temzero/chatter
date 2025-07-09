import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  sliderVariants,
  sliderTransition,
} from "@/animations/slidingAnimations";

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
