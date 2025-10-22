import { useEffect } from "react";

interface UseAudioDiskDragProps {
  isPlaying: boolean;
  duration: number;
  handleDragMove: (clientX: number, clientY: number) => void;
  handleDragEnd: () => void;
}

export const useAudioDiskDrag = ({
  isPlaying,
  duration,
  handleDragMove,
  handleDragEnd,
}: UseAudioDiskDragProps) => {
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const onMouseUp = () => handleDragEnd();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        handleDragMove(touch.clientX, touch.clientY);
      }
    };
    const onTouchEnd = () => handleDragEnd();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isPlaying, duration, handleDragMove, handleDragEnd]);
};
