import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MediaTopBar } from "./MediaTopBar";
import { MediaNavigationButtons } from "./MediaNavigationButtons";
import { MediaBottomInfo } from "./MediaBottomInfo";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import slidingSound from "@/assets/sound/click.mp3";
import { useModalStore } from "@/stores/modalStore";
import { useActiveChatAttachments } from "@/stores/messageStore";
import { RenderModalMedia } from "./RenderModalMedia";
import { MediaSlidingContainer } from "./MediaSlidingContainer";
import { useShallow } from "zustand/shallow";
import { handleDownload } from "@/utils/handleDownload";

export const MediaModal = () => {
  const { currentMediaId, closeModal } = useModalStore(
    useShallow((state) => ({
      currentMediaId: state.currentMediaId,
      closeModal: state.closeModal,
    }))
  );

  // const activeMedia = useMessageStore((state) => state.activeMedia);
  const activeAttachments = useActiveChatAttachments();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [rotation, setRotation] = useState(0);

  const [playSound] = useSoundEffect(slidingSound);

  useEffect(() => {
    if (currentMediaId && activeAttachments) {
      const index = activeAttachments.findIndex(
        (media) => media.id === currentMediaId
      );
      setCurrentIndex(Math.max(0, index));
      setRotation(0);
    }
  }, [currentMediaId, activeAttachments]);

  const goNext = useCallback(() => {
    if (activeAttachments && currentIndex < activeAttachments.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setRotation(0);
      playSound();
    }
  }, [activeAttachments, currentIndex, playSound]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      setRotation(0);
      playSound();
    }
  }, [currentIndex, playSound]);

  const handleRotate = useCallback(() => {
    setRotation((prev) => prev + 90);
  }, []);

  const handleClose = useCallback(() => {
    setRotation(0);
    closeModal();
  }, [closeModal]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        goPrev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        handleClose();
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        e.stopPropagation();
        handleRotate();
      } else if (e.key.toLowerCase() === "d") {
        e.preventDefault();
        e.stopPropagation();
        if (activeAttachments) handleDownload(activeAttachments[currentIndex]);
      }
    },
    [goNext, goPrev, handleClose, handleRotate, currentIndex, activeAttachments]
  );

  useEffect(() => {
    if (currentMediaId) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentMediaId, handleKeyDown]);

  if (!currentMediaId || !activeAttachments || activeAttachments.length === 0)
    return null;

  const currentMedia = activeAttachments[currentIndex];

  return (
    <>
      <MediaTopBar
        media={currentMedia}
        onRotate={handleRotate}
        onClose={handleClose}
      />

      <MediaNavigationButtons
        currentIndex={currentIndex}
        mediaLength={activeAttachments.length}
        onNext={goNext}
        onPrev={goPrev}
      />

      <motion.div
        // className="w-full h-full border-4"
        initial={{ opacity: 0, scale: 0.1, y: 2000 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.1, y: 2000 }}
        transition={{ type: "spring", stiffness: 300, damping: 29 }}
      >
        <MediaSlidingContainer
          direction={direction}
          uniqueKey={currentMedia.id}
        >
          <RenderModalMedia media={currentMedia} rotation={rotation} />
        </MediaSlidingContainer>
      </motion.div>

      <MediaBottomInfo
        media={currentMedia}
        currentIndex={currentIndex}
        mediaLength={activeAttachments.length}
      />
    </>
  );
};

export default MediaModal;
