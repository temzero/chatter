import mediaManager from "@/services/media/mediaManager";
import { useEffect, RefObject } from "react";

interface UseMediaAttachmentKeysProps {
  isCurrent: boolean;
  attachmentType: string;
  videoRef?: RefObject<HTMLVideoElement | null>;
  audioPlayerRef?: RefObject<{ togglePlayPause: () => void } | null>;
  scrollContainerRef?: RefObject<HTMLDivElement | null>;
}

export const useMediaAttachmentKeys = ({
  isCurrent,
  attachmentType,
  videoRef,
  audioPlayerRef,
  scrollContainerRef,
}: UseMediaAttachmentKeysProps) => {
  useEffect(() => {
    if (!isCurrent) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCurrent) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          e.stopPropagation();

          if (attachmentType === "video" && videoRef?.current) {
            mediaManager.play(videoRef.current); // use mediaManager
          }

          if (attachmentType === "audio" && audioPlayerRef?.current) {
            audioPlayerRef.current.togglePlayPause(); // already uses mediaManager internally
          }
          break;

        case "ArrowUp":
        case "ArrowDown":
          if (scrollContainerRef?.current) {
            e.preventDefault();
            e.stopPropagation();
            const container = scrollContainerRef.current;
            const amount = container.clientHeight * 0.8;
            container.scrollBy({
              top: e.key === "ArrowDown" ? amount : -amount,
              behavior: "smooth",
            });
          }
          break;

        default:
          return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCurrent, attachmentType, videoRef, audioPlayerRef, scrollContainerRef]);
};
