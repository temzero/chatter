import { MotionProps } from "framer-motion";
import { SidebarInfoMode } from "@/types/enums/sidebarInfoMode";

export const sidebarInfoAnimations: Record<string, MotionProps> = {
  [SidebarInfoMode.DEFAULT]: {
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
  [SidebarInfoMode.MEDIA]: {
    initial: { opacity: 0, y: 700 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 26,
        bounce: 0.2,
      },
    },
    exit: {
      opacity: 0,
      y: 900,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  },
  
  fallback: {
    initial: { opacity: 0, x: "var(--sidebar-width)" },
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
      x: "var(--sidebar-width)",
      transition: { duration: 0.2 },
    },
  },
};
