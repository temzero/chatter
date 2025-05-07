import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MediaTopBar } from "./MediaTopBar";
import { MediaNavigationButtons } from "./MediaNavigationButtons";
import { SliderMediaContent } from "./SliderMediaContent";
import { MediaBottomInfo } from "./MediaBottomInfo";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import slidingSound from "@/assets/sound/click.mp3";
import { useUIStore } from "@/stores/uiStore";
import { useMessageStore } from "@/stores/messageStore";

export const MediaModal = () => {
  const { currentMediaId, closeModal } = useUIStore();
  const activeMedia = useMessageStore((state) => state.activeMedia);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [slidingAnimation, setSlidingAnimation] = useState(false);

  const playSound = useSoundEffect(slidingSound);

  useEffect(() => {
    if (currentMediaId && activeMedia) {
      const index = activeMedia.findIndex(
        (media) => media.id === currentMediaId
      );
      setCurrentIndex(Math.max(0, index));
      setRotation(0);
    }
  }, [currentMediaId, activeMedia]);

  const goNext = useCallback(() => {
    if (activeMedia && currentIndex < activeMedia.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      setSlidingAnimation((prev) => !prev);
      setRotation(0);
      playSound();
    }
  }, [activeMedia, currentIndex]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      setSlidingAnimation((prev) => !prev);
      setRotation(0);
      playSound();
    }
  }, [currentIndex]);

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
        if (activeMedia) handleDownload(activeMedia[currentIndex]);
      }
    },
    [goNext, goPrev, handleClose, handleRotate, currentIndex, activeMedia]
  );

  useEffect(() => {
    if (currentMediaId) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentMediaId, handleKeyDown]);

  if (!currentMediaId || !activeMedia || activeMedia.length === 0) return null;

  const currentMedia = activeMedia[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md z-[99] flex flex-col items-center justify-center text-white"
    >
      <MediaTopBar
        media={currentMedia}
        onRotate={handleRotate}
        onClose={handleClose}
      />

      <MediaNavigationButtons
        currentIndex={currentIndex}
        mediaLength={activeMedia.length}
        onNext={goNext}
        onPrev={goPrev}
      />

      <motion.div
        className="w-full h-full"
        initial={{ opacity: 0, scale: 0.1, y: 2000 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.1, y: 2000 }}
        transition={{ type: "spring", stiffness: 300, damping: 29 }}
      >
        <SliderMediaContent
          currentIndex={currentIndex}
          direction={direction}
          currentMedia={currentMedia}
          rotation={rotation}
        />
      </motion.div>

      <MediaBottomInfo
        media={currentMedia}
        currentIndex={currentIndex}
        mediaLength={activeMedia.length}
      />
    </motion.div>
  );
};

export default MediaModal;
