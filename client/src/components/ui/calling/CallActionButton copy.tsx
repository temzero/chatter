import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";

interface CallActionButtonProps {
  isVideoCall: boolean;
  isVideoEnabled?: boolean;
  toggleVideo?: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onDragColorChange?: (color: string) => void;
}

export const CallActionButton: React.FC<CallActionButtonProps> = ({
  isVideoCall,
  isVideoEnabled,
  toggleVideo,
  onAccept,
  onDecline,
  onDragColorChange,
}) => {
  const DRAG_THRESHOLD = 100;
  const [isDragging, setIsDragging] = useState(false);
  const y = useMotionValue(0);

  const buttonColor = useTransform(
    y,
    [-DRAG_THRESHOLD, 0, DRAG_THRESHOLD],
    ["#22c55e", "var(--sidebar-color)", "#ef4444"]
  );

  const textColor = useTransform(buttonColor, (bg) =>
    bg === "var(--sidebar-color)" ? "var(--primary-green)" : "#ffffff"
  );

  const rotateOnDrag = useTransform(
    y,
    [-DRAG_THRESHOLD, 0, DRAG_THRESHOLD],
    [-35, 0, 135]
  );

  // 🔹 Notify parent of color change
  useEffect(() => {
    const unsubscribe = y.on("change", (val) => {
      if (val < -DRAG_THRESHOLD) onDragColorChange?.("#22c55e");
      else if (val > DRAG_THRESHOLD) onDragColorChange?.("#ef4444");
      else onDragColorChange?.("#8b8b8b");
    });
    return () => unsubscribe();
  }, [y, onDragColorChange]);

  const handleDragEnd = (_: unknown, info: { offset: { y: number } }) => {
    const offsetY = info.offset.y;
    if (offsetY < -DRAG_THRESHOLD) {
      onAccept();
    } else if (offsetY > DRAG_THRESHOLD) {
      onDecline();
    } else {
      // 🔹 Animate back to center
      animate(y, 0, {
        type: "spring",
        stiffness: 300,
        damping: 25,
      });
    }
    setIsDragging(false);
  };

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: -DRAG_THRESHOLD, bottom: DRAG_THRESHOLD }}
      dragElastic={0.2}
      style={{ y, backgroundColor: buttonColor, zIndex: 3 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      className="relative w-24 h-24 my-12 custom-border rounded-full flex items-center justify-center cursor-grab select-none shadow-lg"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={
            isVideoCall
              ? isVideoEnabled
                ? "videocam"
                : "videocam_off"
              : "call"
          }
          onClick={isVideoCall ? toggleVideo : undefined}
          className="material-symbols-outlined filled text-6xl"
          style={{ zIndex: 1, color: textColor, rotate: rotateOnDrag }}
          initial={{ scale: 0.5, rotate: 0 }}
          animate={
            isDragging
              ? { scale: 1, rotate: 0, opacity: 1 }
              : {
                  scale: [1, 1.2, 1],
                  rotate: [0, 15, -15, 0],
                  opacity: [1, 0.8, 1],
                }
          }
          transition={
            isDragging
              ? { duration: 0.2 }
              : {
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                  repeatDelay: 0.5,
                }
          }
        >
          {isVideoCall
            ? isVideoEnabled
              ? "videocam"
              : "videocam_off"
            : "call"}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
};
