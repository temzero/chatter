import { MotionProps } from "framer-motion";

// Shared animation configurations
export const messageAnimations: Record<string, MotionProps> = {
  sending: {
    animate: { opacity: [0.5, 0.8, 0.5] },
    exit: { opacity: 1 },
    transition: {
      duration: 2.5,
      repeat: Infinity,
      repeatType: "loop",
      ease: "easeInOut",
    },
  },
  SystemMessage: {
    initial: { opacity: 0, scale: 0.5, y: 90 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.5 },
    transition: { type: "spring", stiffness: 500, damping: 28 },
  },
  pinMessage: {
    initial: { opacity: 0, scale: 1.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 2 },
    transition: { type: "spring", stiffness: 300, damping: 29 },
  },
  linkPreview: {
    initial: { opacity: 0, scale: 2 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 2 },
    transition: { duration: 0.25, ease: "easeOut" },
  },
  linkPreviewChatBar: {
    initial: { opacity: 0, y: 10, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 10, scale: 0.8 },
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

export const getMessageAnimation = (
  isMe: boolean,
  isSending?: boolean,
): MotionProps => {
  const baseAnimation: MotionProps = isMe
    ? {
        initial: { opacity: 0, y: 150, scale: 3 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, x: 0, y: 0, scale: 2 },
        transition: {
          type: "spring" as const,
          stiffness: 250,
          damping: 25,
        },
      }
    : {
        initial: { opacity: 0, x: -300 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, scale: 2 },
        transition: {
          type: "spring" as const,
          stiffness: 300,
          damping: 28,
        },
      };

  if (isSending) {
    return {
      ...baseAnimation,
      animate: {
        ...(baseAnimation.animate as object),
        ...(messageAnimations.sending.animate as object),
      },
      transition: {
        ...baseAnimation.transition,
        opacity: messageAnimations.sending.transition,
      },
    } as MotionProps;
  }

  return baseAnimation;
};

export const getSystemMessageAnimation = (isSending?: boolean): MotionProps => {
  if (isSending) {
    return {
      ...messageAnimations.SystemMessage,
      animate: {
        ...(messageAnimations.SystemMessage.animate as object),
        ...(messageAnimations.sending.animate as object),
      },
      transition: {
        ...(messageAnimations.SystemMessage.transition as object),
        opacity: messageAnimations.sending.transition,
      },
    };
  }

  return messageAnimations.SystemMessage;
};
