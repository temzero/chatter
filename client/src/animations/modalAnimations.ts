// animations/modalAnimations.ts

export const modalAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};
export const childrenModalAnimation = {
  initial: { scale: 0.6, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.6, opacity: 0 },
};

export const fadeInUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 },
  transition: { duration: 0.2, ease: "easeOut" },
};
