import { MotionProps } from "framer-motion";

// Shared animation configurations
export const messageAnimations: Record<string, MotionProps> = {
  sending: {
    animate: { opacity: [0.3, 0.6, 0.3] },
    exit: { opacity: 1 },
    transition: {
      duration: 2.5,
      repeat: Infinity,
      repeatType: "loop",
      ease: "easeInOut",
    },
  },
  SystemMessage: {
    initial: { scale: 0.5, y: 90 },
    animate: { scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.5 },
  },
  pinMessage: {
    initial: { opacity: 0, scale: 1.1, y: 50 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 2 },
    transition: { type: "spring", stiffness: 300, damping: 29 },
  },
  linkPreview: {
    initial: { opacity: 0, y: 12, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 8, scale: 0.9 },
  },
  reaction: {
    initial: { scale: 0.5, opacity: 0, y: 12 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.5, opacity: 0, y: 12 },
    transition: { type: "spring", stiffness: 500, damping: 28 },
    whileTap: { scale: 0.8 },
  },
  messagesCount: {
    initial: { scale: 1.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  contextMenu: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.3 },
  },
};

export const getMessageAnimation = (isMe: boolean): MotionProps => {
  return {
    initial: { opacity: 0, x: isMe ? 300 : -300 },
    animate: { opacity: 1, scale: 1, x: 0 },
    exit: { opacity: 0, scale: 2 },
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 28,
    },
  };
};

export const getMessageSendingAnimation = (isSending: boolean): MotionProps => {
  if (isSending) {
    return {
      animate: { opacity: [0.3, 0.6, 0.3] },
      transition: {
        duration: 2.5,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      },
    };
  } else {
    return {
      animate: { opacity: 1 },
      transition: { duration: 0.3, ease: "easeInOut" },
    };
  }
};
