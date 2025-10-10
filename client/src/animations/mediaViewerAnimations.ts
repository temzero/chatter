import { TargetAndTransition } from "framer-motion";

type MediaViewerAnimations = {
  rotation: (rotation: number) => TargetAndTransition;
  zoom: (isZoom: boolean) => TargetAndTransition;
};

export const mediaViewerAnimations: MediaViewerAnimations = {
  rotation: (rotation: number) => ({
    rotate: rotation,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 28,
    },
  }),

  zoom: (isZoom: boolean) => ({
    scale: isZoom ? 2 : 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  }),
};
