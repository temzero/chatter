import { useEffect, useRef, useState } from "react";

export const useSoundEffect = (soundPath?: string, volume = 0.3) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isInteracted, setIsInteracted] = useState(false);

  useEffect(() => {
    // Set up initial interaction listener
    const handleFirstInteraction = () => {
      setIsInteracted(true);
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    if (soundPath) {
      audioRef.current = new Audio(soundPath);
      audioRef.current.volume = volume;
      audioRef.current.load();
    }

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, [soundPath, volume]);

  const playSound = () => {
    if (!isInteracted) {
      // console.warn(
      //   "Audio not played - document hasn't received user interaction yet"
      // );
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((e) => {
          console.error("Audio playback error:", e);
        });
      } catch (e) {
        console.error("Audio playback error:", e);
      }
    }
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return [playSound, stopSound] as const;
};
