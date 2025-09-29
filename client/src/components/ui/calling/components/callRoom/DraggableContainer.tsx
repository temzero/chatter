// components/call-room/DraggableContainer.tsx
import { motion } from "framer-motion";
import React from "react";

interface DraggableContainerProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
  children: React.ReactNode;
}

export const DraggableContainer = ({
  containerRef,
  className = "",
  children,
}: DraggableContainerProps) => {
  return (
    <motion.div
      initial={{ x: "-50%" }}
      className={`absolute bottom-3 left-1/2 z-30 cursor-grab active:cursor-grabbing ${className}`}
      drag
      dragConstraints={containerRef}
      dragElastic={0.8}
      dragMomentum={false}
    >
      {children}
    </motion.div>
  );
};
