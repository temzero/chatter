import { useCallback } from "react";
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
  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onNext();
    },
    [onNext]
  );

  const handlePrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onPrev();
    },
    [onPrev]
  );

  return (
    <>
      {currentIndex > 0 && (
        <button
          className="h-full w-12 flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white hover:bg-gradient-to-r hover:from-[rgba(255,255,255,0.1)] hover:to-[rgba(0,0,0,0)]"
          onClick={handlePrev}
        >
          <i className="material-symbols-outlined text-5xl">chevron_left</i>
        </button>
      )}
      {attachmentLength > 1 && currentIndex < attachmentLength - 1 && (
        <button
          className="h-full w-12 flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white hover:bg-gradient-to-l hover:from-[rgba(255,255,255,0.1)] hover:to-[rgba(0,0,0,0)]"
          onClick={handleNext}
        >
          <i className="material-symbols-outlined text-5xl">chevron_right</i>
        </button>
      )}
    </>
  );
};
