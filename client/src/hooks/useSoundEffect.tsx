import { useEffect, useRef } from "react";

export const useSoundEffect = (soundPath?: string, volume = 0.3) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (soundPath) {
      audioRef.current = new Audio(soundPath);
      audioRef.current.volume = volume;
      audioRef.current.load();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ""; // release resource
        audioRef.current = null;
      }
    };
  }, [soundPath, volume]);

  const playSound = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          playGeneratedSound();
        });
        return;
      } catch (e) {
        console.error("Audio playback error:", e);
      }
    }

    playGeneratedSound();
  };

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const playGeneratedSound = () => {
    try {
      const audioCtx = new (window.AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext)();

      if (audioCtx.state === "suspended") {
        audioCtx.resume().then(() => createAndPlaySound(audioCtx));
      } else {
        createAndPlaySound(audioCtx);
      }
    } catch (e) {
      console.log("Generated audio error:", e);
    }
  };

  const createAndPlaySound = (audioCtx: AudioContext) => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 440;
    gainNode.gain.value = 0.2;

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + 0.2
    );
    oscillator.stop(audioCtx.currentTime + 0.2);
  };

  return [playSound, stopSound] as const;
};
