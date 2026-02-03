import { useRef, useState, useCallback, useEffect } from "react";
import mediaManager from "@/services/media/mediaManager";

export interface AudioPlayerControls {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
}

interface UseAudioPlayerOptions {
  onEnded?: () => void;
  initialCurrentTime?: number;
}

export const useAudioPlayer = (options: UseAudioPlayerOptions = {}) => {
  const { onEnded, initialCurrentTime = 0 } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationResolvedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialCurrentTime);
  const [duration, setDuration] = useState(0);

  /* ------------------------------------------------------------------ */
  /* Helpers                                                            */
  /* ------------------------------------------------------------------ */

  const decodeAudioDuration = async (url: string): Promise<number> => {
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();

    const AudioContextClass =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.AudioContext || (window as any).webkitAudioContext;

    const audioCtx = new AudioContextClass();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    audioCtx.close();
    return audioBuffer.duration;
  };

  /* ------------------------------------------------------------------ */
  /* Controls                                                           */
  /* ------------------------------------------------------------------ */

  const play = useCallback(() => {
    if (audioRef.current) {
      mediaManager.play(audioRef.current);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      mediaManager.stop(audioRef.current);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  /* ------------------------------------------------------------------ */
  /* Event handlers                                                     */
  /* ------------------------------------------------------------------ */

  const resolveDuration = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || durationResolvedRef.current) return;

    const raw = audio.duration;

    // Fast path
    if (Number.isFinite(raw) && raw > 0) {
      durationResolvedRef.current = true;
      setDuration(raw);
      return;
    }

    // Fallback (decode full file)
    try {
      const decoded = await decodeAudioDuration(audio.src);
      if (!durationResolvedRef.current && Number.isFinite(decoded)) {
        durationResolvedRef.current = true;
        setDuration(decoded);
      }
    } catch (err) {
      console.warn("Failed to decode audio duration", err);
      setDuration(0);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    onEnded?.();
  }, [onEnded]);

  /* ------------------------------------------------------------------ */
  /* Effect: wire audio element                                         */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", resolveDuration);
    audio.addEventListener("durationchange", resolveDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", resolveDuration);
      audio.removeEventListener("durationchange", resolveDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [handleTimeUpdate, resolveDuration, handleEnded]);

  /* ------------------------------------------------------------------ */
  /* Initial seek                                                       */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (audioRef.current && initialCurrentTime > 0) {
      audioRef.current.currentTime = initialCurrentTime;
    }
  }, [initialCurrentTime]);

  /* ------------------------------------------------------------------ */

  return {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    togglePlayPause,
    seekTo,
    setCurrentTime,
    setDuration,
    setIsPlaying,
  };
};
