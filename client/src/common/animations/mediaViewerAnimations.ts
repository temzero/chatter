import { TargetAndTransition } from "framer-motion";

type MediaViewerAnimations = {
  rotation: (rotation: number) => TargetAndTransition;
  zoom: (isZoom: boolean) => TargetAndTransition;
};

export const mediaViewerAnimations: MediaViewerAnimations = {
  rotation: (rotation: number) => ({
    rotate: rotation,
    transition:
      rotation === 0
        ? { duration: 0 }
        : { type: "spring", stiffness: 300, damping: 28 },
  }),

  zoom: (isZoom: boolean) => ({
    scale: isZoom ? 2 : 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 28,
    },
  }),
};
