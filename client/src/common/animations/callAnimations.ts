import { MotionProps } from "framer-motion";

export const callAnimations: {
  titlePulse: (opacityValues?: number[]) => MotionProps;
  incomingActionButton: (isDragging?: boolean) => MotionProps;
  outgoingActionButton: (isHovering?: boolean) => MotionProps;
} = {
  titlePulse: (opacityValues = [0.6, 0.2, 0.6]) => ({
    animate: { opacity: opacityValues },
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: "loop",
      ease: "easeInOut",
      repeatDelay: 1,
    },
  }),

  incomingActionButton: (isDragging = false) => ({
    initial: { scale: 0.5, rotate: 0 },
    animate: isDragging
      ? { scale: 1, rotate: 0, opacity: 1 }
      : { scale: [1, 1.25, 1], rotate: [0, 15, -15, 0], opacity: [1, 0.8, 1] },
    transition: isDragging
      ? { duration: 0.2 }
      : {
          duration: 0.5,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
          repeatDelay: 0.5,
        },
  }),

  outgoingActionButton: (isHovering = false) => ({
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: [1, 1.5, 1],
      opacity: isHovering ? 1 : [0.4, 0.8, 0.8, 0.4],
      rotate: isHovering ? 0 : [0, 15, -15, 0],
    },
    transition: {
      duration: isHovering ? 0.3 : 0.5,
      repeat: isHovering ? 0 : Infinity,
      repeatType: isHovering ? undefined : "loop",
      ease: "easeInOut",
      repeatDelay: isHovering ? 0 : 0.5,
    },
  }),
};
