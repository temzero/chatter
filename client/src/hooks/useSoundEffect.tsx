import { useEffect, useRef } from "react";

export const useSoundEffect = (soundPath?: string, volume = 0.3) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload sound if provided
  useEffect(() => {
    if (soundPath) {
      audioRef.current = new Audio(soundPath);
      audioRef.current.volume = volume;
      audioRef.current.load();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ""; // Release memory
        audioRef.current = null;
      }
    };
  }, [soundPath, volume]);

  const playSound = () => {
    // Respect user's reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Try to play imported sound first
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          // Fallback to generated sound if playback fails
          playGeneratedSound();
        });
        return;
      } catch (e) {
        console.error("Audio playback error:", e);
      }
    }

    // Fallback to generated sound
    playGeneratedSound();
  };

  const playGeneratedSound = () => {
    try {
      const audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext!)();

      // AudioContext starts in suspended state
      if (audioCtx.state === "suspended") {
        audioCtx
          .resume()
          .then(() => {
            // Now we can create and play the sound
            createAndPlaySound(audioCtx);
          })
          .catch((e) => {
            console.log("AudioContext resume failed:", e);
          });
      } else {
        createAndPlaySound(audioCtx);
      }
    } catch (e) {
      console.log("Generated audio error:", e);
    }
  };

  // Helper function to create and play the sound
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

  return playSound;
};
