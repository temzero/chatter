import React, { Children } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RenderModalMedia } from "./RenderModalMedia";

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

interface SliderMediaContentProps {
  currentIndex: number;
  direction: number;
  currentMedia: any; // Replace 'any' with your actual media type
  rotation: number;
}

export const SliderMediaContent: React.FC<SliderMediaContentProps> = ({
  currentIndex,
  direction,
  currentMedia,
  rotation,
}) => {
  return (
    <AnimatePresence initial={false} custom={direction}>
      <motion.div
        key={currentIndex}
        custom={direction}
        variants={sliderVariants}
        initial="incoming"
        animate="active"
        exit="exit"
        transition={sliderTransition}
        className="w-full h-full flex items-center justify-center scrollbar-hide select-none overflow-auto"
      >
        {Children}
      </motion.div>
    </AnimatePresence>
  );
};
