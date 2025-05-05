// src/hooks/useSoundEffect.ts
import { useEffect, useRef } from 'react';

type SoundType = 'next' | 'prev';

export const useSoundEffect = (soundPath?: string | SoundType) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Preload sound if provided
  useEffect(() => {
    if (soundPath) {
      audioRef.current = new Audio(soundPath);
      audioRef.current.volume = 0.3;
      audioRef.current.load();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [soundPath]);

  const playSound = (type: SoundType) => {
    // Try to play imported sound first
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Fallback to generated sound if playback fails
        playGeneratedSound(type);
      });
      return;
    }

    // Fallback to generated sound
    playGeneratedSound(type);
  };

  const playGeneratedSound = (type: 'next' | 'prev') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const panner = audioCtx.createStereoPanner();
  
      oscillator.type = 'sine';
      oscillator.frequency.value = type === 'next' ? 240 : 200;
      gainNode.gain.value = 0.2;
      panner.pan.value = type === 'next' ? -0.5 : 0.5;
  
      // Simplified modulation
      const lfo = audioCtx.createOscillator();
      lfo.frequency.value = 8;
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 30;
  
      // Minimal connections
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator.frequency);
      oscillator.connect(gainNode);
      gainNode.connect(panner);
      panner.connect(audioCtx.destination);
  
      // Start/stop with fade
      lfo.start();
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
  
      oscillator.stop(audioCtx.currentTime + 0.35);
      lfo.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.log("Audio error:", e);
    }
  };

  return playSound;
};