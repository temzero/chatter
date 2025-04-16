import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SlidingContainerProps {
  selectedType: string;
  direction: number;
  children: React.ReactNode;
}

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 400 : -400,
      opacity: 0,
    };
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      x: direction > 0 ? -400 : 400,
      opacity: 0,
    };
  },
};

const SlidingContainer: React.FC<SlidingContainerProps> = ({
  selectedType,
  children,
  direction,
}) => {
  return (
    <div className="flex-1 overflow-x-hidden overflow-y-auto relative h-full">
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={selectedType}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
          }}
          className="absolute inset-0"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SlidingContainer;
