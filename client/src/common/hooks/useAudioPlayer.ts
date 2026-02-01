// hooks/useAudioPlayer.ts - UPDATED VERSION
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
  
  // Use external audioRef if provided, otherwise create internal one
  const audioRef = useRef<HTMLAudioElement | null>(null);;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialCurrentTime);
  const [duration, setDuration] = useState(0);

  // Audio control methods
  const play = useCallback(() => {
    if (audioRef.current) {
      mediaManager.play(audioRef.current);
    }
  }, [audioRef]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      mediaManager.stop(audioRef.current);
    }
  }, [audioRef]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, [audioRef]);

  // Event handlers
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      if (initialCurrentTime > 0) {
        audioRef.current.currentTime = initialCurrentTime;
        setCurrentTime(initialCurrentTime);
      }
    }
  }, [audioRef, initialCurrentTime]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [audioRef]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    onEnded?.();
  }, [onEnded]);

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioRef, handleTimeUpdate, handleLoadedMetadata, handleEnded]);

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