import { MotionProps } from "framer-motion";

export const chatBarAnimations: Record<string, MotionProps> = {
  sendButton: {
    initial: {
      opacity: 0,
      x: 12,
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: 12,
    },
  },

  sendButtonIcon: {
    initial: {
      scale: 0,
    },
    animate: {
      scale: 1,
      x: 0,
    },
    transition: {
      duration: 0.3,
    },
  },

  leftIcon: {
    initial: {
      opacity: 0,
      x: -20,
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: -20,
    },
  },
  micButton: {
    initial: {
      opacity: 0,
      y: 30,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    exit: {
      opacity: 0,
      y: 30,
    },
  },
};
