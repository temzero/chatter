import { MotionProps } from "framer-motion";

export const buttonAnimation: MotionProps = {
  whileTap: {
    scale: 1.35,
  },
  transition: {
    type: "spring",
    stiffness: 400,
    damping: 20,
  },
};
