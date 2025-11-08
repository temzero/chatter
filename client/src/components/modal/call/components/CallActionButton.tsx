import React, { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { callAnimations } from "@/common/animations/callAnimations";

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

  const textColor = useTransform(y, (val) => {
    if (val < -DRAG_THRESHOLD) return "white"; // white on green
    if (val > DRAG_THRESHOLD) return "white"; // white on red
    return "var(--primary-green)"; // green on default
  });

  // 🔹 Single function for threshold colors
  const getColor = (val: number, defaultColor: string) => {
    if (val < -DRAG_THRESHOLD) return "#22c55e";
    if (val > DRAG_THRESHOLD) return "#ef4444";
    return defaultColor;
  };

  // 🔹 MotionValues
  const buttonColor = useTransform(y, (val) =>
    getColor(val, "var(--sidebar-color)")
  );
  const boundaryColor = useTransform(y, (val) =>
    getColor(val, "var(--border-color)")
  );

  const rotateOnDrag = useTransform(
    y,
    [-DRAG_THRESHOLD, 0, DRAG_THRESHOLD],
    [-35, 0, 135]
  );

  // 🔹 Notify parent on color change
  useEffect(() => {
    if (!onDragColorChange) return;
    const unsubscribe = y.on("change", (val) =>
      onDragColorChange(getColor(val, "#8b8b8b"))
    );
    return () => unsubscribe();
  }, [y, onDragColorChange]);

  const handleDragEnd = (_: unknown, info: { offset: { y: number } }) => {
    const offsetY = info.offset.y;
    if (offsetY < -DRAG_THRESHOLD) onAccept();
    else if (offsetY > DRAG_THRESHOLD) onDecline();
    else animate(y, 0, { type: "spring", stiffness: 900, damping: 30 });

    setIsDragging(false);
  };

  return (
    <div className="relative flex items-center justify-center my-12">
      {isDragging && (
        <motion.div
          className="absolute rounded-full pointer-events-none border-2"
          style={{
            borderColor: boundaryColor,
            width: `${DRAG_THRESHOLD * 2}px`,
            height: `${DRAG_THRESHOLD * 2}px`,
            zIndex: 1,
          }}
        />
      )}

      <motion.div
        drag="y"
        dragConstraints={{ top: -DRAG_THRESHOLD, bottom: DRAG_THRESHOLD }}
        dragElastic={0.2}
        style={{ y, backgroundColor: buttonColor, zIndex: 3 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        className="relative w-24 h-24 rounded-full flex items-center justify-center cursor-grab select-none shadow-xl custom-border"
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
            style={{ color: textColor, rotate: rotateOnDrag }}
            {...callAnimations.incomingActionButton(isDragging)}
          >
            {isVideoCall
              ? isVideoEnabled
                ? "videocam"
                : "videocam_off"
              : "call"}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
