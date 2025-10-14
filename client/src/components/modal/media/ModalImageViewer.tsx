import React, { useState, forwardRef } from "react";
import { motion } from "framer-motion";
import { mediaViewerAnimations } from "@/animations/mediaViewerAnimations";
import type { AttachmentResponse } from "@/shared/types/responses/message.response";

export const ModalImageViewer = forwardRef<
  HTMLDivElement,
  { attachment: AttachmentResponse; rotation: number }
>(({ attachment, rotation }, ref) => {
  const [isZoom, setZoom] = useState(false);
  const [translateY, setTranslateY] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!isZoom) return;

    const delta = e.deltaY;
    const maxX = window.innerWidth / 1.5;
    const maxY = window.innerHeight / 1.5;

    if (e.shiftKey) {
      setTranslateX((prev) => {
        const newX = prev - delta * 0.5;
        return Math.max(-maxX, Math.min(maxX, newX));
      });
    } else {
      setTranslateY((prev) => {
        const newY = prev - delta * 0.5;
        return Math.max(-maxY, Math.min(maxY, newY));
      });
    }
  };

  const handleZoom = (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const offsetX = ((e.clientX - rect.left) / w) * 100;
    const offsetY = ((e.clientY - rect.top) / h) * 100;
    setZoomOrigin(`${offsetX}% ${offsetY}%`);

    setZoom((prev) => {
      const newZoom = !prev;
      if (!newZoom) {
        setTranslateX(0);
        setTranslateY(0);
      }
      return newZoom;
    });
  };

  return (
    <motion.div
      ref={ref}
      onWheel={handleWheel}
      className="w-full h-full flex items-center justify-center"
      animate={mediaViewerAnimations.rotation(rotation)}
    >
      <motion.img
        onClick={handleZoom}
        src={attachment.url}
        alt={attachment.filename || "Image"}
        draggable={false}
        className="mx-auto my-auto object-contain rounded max-h-[90vh]"
        style={{
          cursor: isZoom ? "zoom-out" : "zoom-in",
          transformOrigin: zoomOrigin,
        }}
        animate={{
          scale: isZoom ? 2 : 1,
          x: translateX,
          y: translateY,
          transition: { type: "spring", stiffness: 200, damping: 20 },
        }}
      />
    </motion.div>
  );
});
