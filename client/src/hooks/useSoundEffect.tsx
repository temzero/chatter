import { useEffect, useRef, useState } from "react";

export const useSoundEffect = (soundPath?: string, volume = 0.3) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isInteracted, setIsInteracted] = useState(false);

  useEffect(() => {
    const handleFirstInteraction = () => {
      setIsInteracted(true);
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };

    // Add multiple interaction listeners
    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);
    document.addEventListener("touchstart", handleFirstInteraction);

    if (soundPath) {
      try {
        audioRef.current = new Audio(soundPath);
        audioRef.current.volume = volume;
        audioRef.current.load();
      } catch (e) {
        console.error("Audio initialization error:", e);
      }
    }

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, [soundPath, volume]);

  const playSound = () => {
    if (!isInteracted) {
      console.warn("Audio not played - no user interaction yet");
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (!audioRef.current && soundPath) {
      // Fallback: create new audio element if none exists
      audioRef.current = new Audio(soundPath);
      audioRef.current.volume = volume;
    }

    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((e) => {
          console.error("Audio play failed:", e);
          // Fallback: try creating a new audio element
          const audio = new Audio(soundPath);
          audio.volume = volume;
          audio
            .play()
            .catch((e) => console.error("Fallback audio play failed:", e));
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
