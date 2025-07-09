// animations/slidingAnimation.ts
import { Variants, Transition } from "framer-motion";

export const sliderVariants: Variants = {
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

export const sliderTransition: Transition = {
  duration: 0.3,
  type: "spring",
  stiffness: 300,
  damping: 20,
  mass: 0.5,
};
