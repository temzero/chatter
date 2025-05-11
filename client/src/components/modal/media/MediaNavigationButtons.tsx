// components/MediaNavigationButtons.tsx
import { useCallback } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import slideSound from '@/assets/sound/click.mp3';

interface MediaNavigationButtonsProps {
  currentIndex: number;
  mediaLength: number;
  onNext: () => void;
  onPrev: () => void;
}

export const MediaNavigationButtons = ({ 
  currentIndex, 
  mediaLength,
  onNext,
  onPrev
}: MediaNavigationButtonsProps) => {
  const playSound = useSoundEffect(slideSound);

  const handleNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('next');
    onNext();
  }, [onNext, playSound]);

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    playSound('prev');
    onPrev();
  }, [onPrev, playSound]);

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
      {mediaLength > 1 && currentIndex < mediaLength - 1 && (
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