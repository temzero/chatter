import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { MediaViewerTopBar } from "./MediaViewerTopBar";
import { MediaViewerNavigationButtons } from "./MediaViewerNavigationButtons";
import { MediaViewerBottomInfo } from "./MediaViewerBottomInfo";
import { useModalStore } from "@/stores/modalStore";
import { useActiveChatAttachments } from "@/stores/messageStore";
import { RenderModalAttachment } from "./RenderModalAttachment";
import { useShallow } from "zustand/shallow";
import { handleDownload } from "@/utils/handleDownload";
import { useAudioService } from "@/hooks/useAudioService";
import { SoundType } from "@/services/audio.service";

export const MediaViewer = () => {
  const { currentAttachmentId, closeModal } = useModalStore(
    useShallow((state) => ({
      currentAttachmentId: state.currentAttachmentId,
      closeModal: state.closeModal,
    }))
  );

  const activeAttachments = useActiveChatAttachments();

  const getInitialIndex = () => {
    if (!currentAttachmentId || !activeAttachments) return 0;
    const index = activeAttachments.findIndex(
      (media) => media.id === currentAttachmentId
    );
    return index !== -1 ? index : 0;
  };

  const hasMounted = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(getInitialIndex());
  const [rotation, setRotation] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  const { playSound } = useAudioService(); // ✅ central sound manager
  const controls = useAnimationControls();

  useEffect(() => {
    if (
      currentAttachmentId &&
      activeAttachments &&
      activeAttachments.length > 0
    ) {
      const index = activeAttachments.findIndex(
        (media) => media.id === currentAttachmentId
      );
      if (index !== -1) {
        setCurrentIndex(index);
        setRotation(0);
        setIsReady(true);
      }
    }
  }, [currentAttachmentId, activeAttachments]);

  const scrollToMedia = useCallback(
    (index: number, animate: boolean = true) => {
      if (containerRef) {
        const containerWidth = containerRef.clientWidth;
        const targetX = -index * containerWidth;

        if (animate) {
          controls.start({
            x: targetX,
            transition: { type: "spring", stiffness: 290, damping: 29 },
          });
        } else {
          controls.set({ x: targetX });
        }
      }
    },
    [containerRef, controls]
  );

  const goNext = useCallback(() => {
    if (activeAttachments && currentIndex < activeAttachments.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      scrollToMedia(newIndex, true);
      setRotation(0);
      playSound(SoundType.NOTIFICATION); // ✅ pick a central sound type
    }
  }, [activeAttachments, currentIndex, playSound, scrollToMedia]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      scrollToMedia(newIndex, true);
      setRotation(0);
      playSound(SoundType.NOTIFICATION); // ✅ same sound for prev
    }
  }, [currentIndex, playSound, scrollToMedia]);

  const handleRotate = useCallback(() => {
    setRotation((prev) => prev + 90);
  }, []);

  const handleClose = useCallback(() => {
    setRotation(0);
    closeModal();
  }, [closeModal]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.stopPropagation();

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        handleRotate();
      } else if (e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (activeAttachments) handleDownload(activeAttachments[currentIndex]);
      }
    },
    [goNext, goPrev, handleClose, handleRotate, currentIndex, activeAttachments]
  );

  useEffect(() => {
    if (currentAttachmentId) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentAttachmentId, handleKeyDown]);

  useEffect(() => {
    const onResize = () => {
      if (!containerRef) return;

      const containerWidth = containerRef.clientWidth;
      const targetX = -currentIndex * containerWidth;

      if (hasMounted.current) {
        controls.start({
          x: targetX,
          transition: { type: "spring", stiffness: 290, damping: 29 },
        });
      } else {
        hasMounted.current = true;
        controls.set({ x: targetX });
      }
    };

    onResize();
    const resizeHandler = () => onResize();
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, [containerRef, currentIndex, controls]);

  if (!isReady) return null;

  const currentMedia =
    currentIndex >= 0 && currentIndex < activeAttachments.length
      ? activeAttachments[currentIndex]
      : null;

  if (!currentMedia) return null;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none">
      <MediaViewerTopBar
        attachment={currentMedia}
        onRotate={handleRotate}
        onClose={handleClose}
      />

      <MediaViewerNavigationButtons
        currentIndex={currentIndex}
        attachmentLength={activeAttachments.length}
        onNext={goNext}
        onPrev={goPrev}
      />

      <motion.div
        ref={setContainerRef}
        className="flex w-full h-full"
        animate={controls}
        initial={false}
      >
        {activeAttachments.map((attachment, index) => (
          <motion.div
            key={attachment.id}
            className="w-full h-full flex-shrink-0 flex items-center justify-center"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{
              opacity: index === currentIndex ? 1 : 0.2,
              scale: index === currentIndex ? 1 : 0.2,
            }}
            exit={{ scale: 0.2, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
          >
            <RenderModalAttachment
              attachment={attachment}
              rotation={index === currentIndex ? rotation : 0}
              isCurrent={index === currentIndex}
            />
          </motion.div>
        ))}
      </motion.div>

      <MediaViewerBottomInfo
        attachment={currentMedia}
        currentIndex={currentIndex}
        mediaLength={activeAttachments.length}
      />
    </div>
  );
};

export default MediaViewer;
