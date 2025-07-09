// Shared animation configurations
export const messageAnimations = {
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
  pinMessage: {
    initial: { opacity: 0, scale: 1.1, y: 50 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { type: "spring", stiffness: 300, damping: 29 },
  },
  none: {
    initial: false,
    animate: false,
    transition: {},
  },
};
