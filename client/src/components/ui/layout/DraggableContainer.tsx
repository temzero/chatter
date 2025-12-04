// components/call-room/DraggableContainer.tsx
import { motion } from "framer-motion";
import * as React from "react";

interface DraggableContainerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
  children: React.ReactNode;
  position?: "bottom-middle" | "bottom-right";
}

export const DraggableContainer = ({
  containerRef,
  className = "",
  children,
  position = "bottom-middle",
}: DraggableContainerProps) => {
  const positionClasses = {
    "bottom-middle": "bottom-3! left-1/2! -translate-x-1/2!",
    "bottom-right": "bottom-3! right-3!",
  };
  const initialX = position === "bottom-middle" ? { x: "-50%!" } : { x: 0 };

  return (
    <motion.div
      initial={{ scale: 0.2, opacity: 0, ...initialX }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={`absolute! cursor-grab active:cursor-grabbing ${positionClasses[position]} ${className} ${className}`}
      drag
      dragConstraints={containerRef}
      dragElastic={0.8}
      dragMomentum={false}
      style={{ zIndex: 10 }}
    >
      {children}
    </motion.div>
  );
};
