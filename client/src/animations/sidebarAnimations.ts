// animations/sidebarAnimations.ts
import { MotionProps } from "framer-motion";
import { SidebarMode } from "@/types/enums/sidebarMode";

export const sidebarAnimations: Record<string, MotionProps> = {
  [SidebarMode.DEFAULT]: {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0,
      },
    },
  },
  [SidebarMode.SEARCH]: {
    initial: { opacity: 0, y: 400 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 28,
        bounce: 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: 400,
      transition: {
        duration: 0.2,
      },
    },
  },
  [SidebarMode.NEW_CHAT]: {
    initial: { opacity: 0, y: 400 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 28,
        bounce: 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: 400,
      transition: {
        duration: 0.2,
      },
    },
  },
  fallback: {
    initial: { opacity: 0, x: -300 },
    animate: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 28,
        bounce: 0.2,
      },
    },
    exit: {
      opacity: 0,
      x: -300,
      transition: {
        duration: 0.2,
      },
    },
  },
};
