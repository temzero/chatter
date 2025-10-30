import { useCallback, useEffect } from "react";
import { handleDownload } from "@/common/utils/handleDownload";
import { getCloseModal } from "@/stores/modalStore";
import { useActiveChatAttachments } from "@/stores/messageAttachmentStore";

interface UseMediaViewerKeysProps {
  currentIndex: number;
  goNext: () => void;
  goPrev: () => void;
  handleRotate: () => void;
  isActive: boolean;
}

export const useMediaViewerKeys = ({
  currentIndex,
  goNext,
  goPrev,
  handleRotate,
  isActive,
}: UseMediaViewerKeysProps) => {
  const closeModal = getCloseModal();
  const activeAttachments = useActiveChatAttachments();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive) return;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          e.stopPropagation();
          goNext();
          break;

        case "ArrowLeft":
          e.preventDefault();
          e.stopPropagation();
          goPrev();
          break;

        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          closeModal();
          break;

        case "r":
        case "R":
          e.preventDefault();
          e.stopPropagation();
          handleRotate();
          break;

        case "d":
        case "D":
          e.preventDefault();
          e.stopPropagation();
          if (activeAttachments && currentIndex >= 0) {
            handleDownload(activeAttachments[currentIndex]);
          }
          break;

        default:
          // Let other keys be handled by other listeners
          return;
      }
    },
    [
      isActive,
      goNext,
      goPrev,
      closeModal,
      handleRotate,
      activeAttachments,
      currentIndex,
    ]
  );

  useEffect(() => {
    if (isActive) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, handleKeyDown]);
};
