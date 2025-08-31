import { useCallback } from "react";
import { useAudioService } from "@/hooks/useAudioService";
import { SoundType } from "@/services/audio.service";
interface MediaViewerNavigationButtonsProps {
  currentIndex: number;
  attachmentLength: number;
  onNext: () => void;
  onPrev: () => void;
}

export const MediaViewerNavigationButtons = ({
  currentIndex,
  attachmentLength,
  onNext,
  onPrev,
}: MediaViewerNavigationButtonsProps) => {
  const { playSound } = useAudioService();

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      playSound(SoundType.NOTIFICATION);
      onNext();
    },
    [onNext, playSound]
  );

  const handlePrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      playSound(SoundType.NOTIFICATION); // ✅ same here
      onPrev();
    },
    [onPrev, playSound]
  );

  return (
    <>
      {currentIndex > 0 && (
        <button
          className="h-full w-12 flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white hover:bg-gradient-to-r hover:from-[rgba(255,255,255,0.05)] hover:to-[rgba(0,0,0,0)]"
          onClick={handlePrev}
        >
          <i className="material-symbols-outlined text-5xl">chevron_left</i>
        </button>
      )}
      {attachmentLength > 1 && currentIndex < attachmentLength - 1 && (
        <button
          className="h-full w-12 flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white hover:bg-gradient-to-l hover:from-[rgba(255,255,255,0.05)] hover:to-[rgba(0,0,0,0)]"
          onClick={handleNext}
        >
          <i className="material-symbols-outlined text-5xl">chevron_right</i>
        </button>
      )}
    </>
  );
};
