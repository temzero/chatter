import { MotionProps } from "framer-motion";

// Shared animation configurations
export const messageAnimations: Record<string, MotionProps> = {
  myMessage: {
    initial: { opacity: 0, scale: 0.1, x: 100, y: 0 },
    animate: { opacity: 1, scale: 1, x: 0, y: 0 },
    transition: { type: "spring", stiffness: 300, damping: 29 },
  },
  otherMessage: {
    initial: { opacity: 0, scale: 0.1, x: -200, y: 30 },
    animate: { opacity: 1, scale: 1, x: 0, y: 0 },
    transition: { type: "spring", stiffness: 222, damping: 20 },
  },
  SystemMessage: {
    initial: { opacity: 0, scale: 0.1, y: 60 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { type: "spring", stiffness: 300, damping: 29 },
  },
  pinMessage: {
    initial: { opacity: 0, scale: 1.1, y: 50 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { type: "spring", stiffness: 300, damping: 29 },
  },
  reaction: {
    initial: { scale: 0.5, opacity: 0, y: 12 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.5, opacity: 0, y: 12 },
    transition: { type: "spring", stiffness: 500, damping: 28 },
    whileTap: { scale: 0.8 },
  },
  contextMenu: {
    initial: { opacity: 0, scale: 0.2 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.2 },
    transition: { type: "spring", stiffness: 350, damping: 30 },
  },
};
