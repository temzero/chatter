// animations/slidingAnimation.ts
import { MotionProps } from "framer-motion";

export const slidingAnimations = {
  slide: (direction: number): MotionProps => ({
    custom: direction,
    initial: {
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      position: "absolute" as const,
    },
    animate: { x: 0, scale: 1, opacity: 1, position: "relative" as const },
    // exit: {
    //   x: direction > 0 ? "-100%" : "100%",
    //   opacity: 0,
    //   position: "absolute" as const,
    // },
    transition: {
      duration: 0.3,
      type: "spring",
      stiffness: 300,
      damping: 20,
      mass: 0.5,
    },
  }),
};
