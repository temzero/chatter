import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { slidingAnimations } from "@/common/animations/slidingAnimations";

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
    <div className="w-full h-full overflow-hidden relative">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={uniqueKey}
          className={`w-full h-full ${className}`}
          {...slidingAnimations.slide(direction)}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
