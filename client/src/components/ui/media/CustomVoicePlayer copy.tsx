import clsx from "clsx";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { formatDuration } from "@/common/utils/format/formatDuration";
import mediaManager from "@/services/media/mediaManager";
import { motion } from "framer-motion";

interface CustomVoicePlayerProps {
  mediaUrl: string;
  fileName?: string;
  showDuration?: boolean;
  onOpenModal?: () => void;
}

export interface VoicePlayerRef {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
}

const CustomVoicePlayer = forwardRef<VoicePlayerRef, CustomVoicePlayerProps>(
  ({ mediaUrl, showDuration = true, onOpenModal }, ref) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setDuration(audioRef.current.duration);
        handleTimeUpdate();
      }
    };

    const handleTimeUpdate = () => {
      if (!audioRef.current) return;
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration || duration;
      setCurrentTime(current);
      setProgress((current / dur) * 100);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!audioRef.current) return;
      const newTime = (Number(e.target.value) / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setProgress(Number(e.target.value));
    };

    // Stop audio if another audio starts (mediaManager handles this)
    useEffect(() => {
      const handleExternalPause = () => setIsPlaying(false);
      const audioElement = audioRef.current;
      if (audioElement) {
        audioElement.addEventListener("pause", handleExternalPause);
      }
      return () => {
        if (audioElement) {
          audioElement.removeEventListener("pause", handleExternalPause);
          mediaManager.stop(audioElement);
        }
      };
    }, []);

    useImperativeHandle(ref, () => ({
      play: () => {
        if (audioRef.current) {
          mediaManager.play(audioRef.current);
          setIsPlaying(true);
        }
      },
      pause: () => {
        if (audioRef.current) {
          mediaManager.stop(audioRef.current);
          setIsPlaying(false);
        }
      },
      togglePlayPause: () => {
        if (!audioRef.current) return;
        if (isPlaying) {
          mediaManager.stop(audioRef.current);
          setIsPlaying(false);
        } else {
          mediaManager.play(audioRef.current);
          setIsPlaying(true);
        }
      },
    }));

    const togglePlayPause = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (!audioRef.current) return;
      if (isPlaying) {
        mediaManager.stop(audioRef.current);
        setIsPlaying(false);
      } else {
        mediaManager.play(audioRef.current);
        setIsPlaying(true);
      }
    };

    return (
      <div
        className={clsx(
          "w-full flex items-center overflow-hidden p-1 min-w-[300px]",
        )}
      >
        <button
          onClick={togglePlayPause}
          className={clsx(
            "relative rounded-full!",
            "overflow-hidden hover:opacity-70 border-2 border-(--input-border-color) w-10 h-10",
          )}
        >
          <motion.div
            className="absolute inset-0 w-full h-full flex items-center justify-center"
            animate={{
              backgroundColor: isPlaying
                ? [
                    "var(--glass-panel-color)",
                    "var(--primary-green-glow)",
                    "var(--glass-panel-color)",
                  ]
                : "transparent",
            }}
            transition={{
              duration: 3,
              repeat: isPlaying ? Infinity : 0,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            <motion.i
              className={clsx("material-symbols-outlined filled text-3xl!")}
              animate={{
                color: isPlaying ? "var(--primary-green-dark)" : "currentColor",
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
            >
              mic
            </motion.i>
          </motion.div>
        </button>

        <div className="flex flex-col gap-1 flex-1 min-w-0 ml-2">
          <div className="flex items-center justify-between gap-2 w-full">
            <input
              type="range"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1.5 rounded-full! cursor-pointer appearance-none custom-slider"
              style={{
                background: `linear-gradient(to right, var(--primary-green-glow) ${progress}%, var(--input-border-color) ${progress}%)`,
              }}
            />
          </div>

          {showDuration && (
            <div
              onClick={onOpenModal}
              className="flex text-xs opacity-50 whitespace-nowrap shrink-0 hover:opacity-100"
            >
              {currentTime > 0 && (
                <span>
                  {formatDuration(currentTime)}
                  <span className="px-0.5">/</span>
                </span>
              )}
              {duration > 0 && formatDuration(duration)}
            </div>
          )}

          <audio
            ref={audioRef}
            className="hidden"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => {
              setIsPlaying(false);
            }}
          >
            <source src={mediaUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    );
  },
);

export default CustomVoicePlayer;
