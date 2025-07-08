// components/SlidingContainer.tsx
import { motion, AnimationControls } from "framer-motion";
import React from "react";
import { RenderModalAttachment } from "./RenderModalAttachment";
import type { AttachmentResponse } from "@/types/responses/message.response";

interface SlidingContainerProps {
  attachments: AttachmentResponse[];
  currentIndex: number;
  rotation: number;
  controls: AnimationControls;
  setContainerRef: (ref: HTMLDivElement | null) => void;
}

export const SlidingContainer: React.FC<SlidingContainerProps> = ({
  attachments,
  currentIndex,
  rotation,
  controls,
  setContainerRef,
}) => {
  return (
    <motion.div
      ref={setContainerRef}
      className="flex w-full h-full"
      animate={controls}
      initial={{ x: 0 }}
    >
      {attachments.map((attachment, index) => (
        <div
          key={attachment.id}
          className="w-full h-full flex-shrink-0 flex items-center justify-center"
        >
          <RenderModalAttachment
            attachment={attachment}
            rotation={index === currentIndex ? rotation : 0}
          />
        </div>
      ))}
    </motion.div>
  );
};
