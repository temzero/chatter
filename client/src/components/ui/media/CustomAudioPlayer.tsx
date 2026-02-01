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
import { getAudioType } from "@/common/utils/getAudioType";
import { setOpenMediaModal } from "@/stores/modalStore";

interface CustomAudioPlayerProps {
  attachmentId: string;
  mediaUrl: string;
  thumbnailUrl?: string;
  fileName?: string;
  isDisplayName?: boolean;
  isCompact?: boolean;
}

export interface AudioPlayerRef {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
}

const CustomAudioPlayer = forwardRef<AudioPlayerRef, CustomAudioPlayerProps>(
  (
    {
      attachmentId,
      mediaUrl,
      thumbnailUrl,
      fileName,
      isDisplayName = true,
      isCompact = false,
    },
    ref,
  ) => {
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

    const handleOpenModal = () => {
      // Pass the currentTime to the onOpenModal callback
      setOpenMediaModal(attachmentId, currentTime);
    };

    return (
      <div
        key={attachmentId}
        className={clsx(
          "w-full p-2 flex items-center custom-border-b overflow-hidden",
          isCompact ? "max-w-60px" : "gap-1",
        )}
      >
        <button
          onClick={togglePlayPause}
          className={clsx(
            "relative w-12 h-12 rounded-full!",
            "overflow-hidden hover:opacity-70 w-12 h-12 border-2 border-(--input-border-color)",
          )}
        >
          {thumbnailUrl && (
            <motion.img
              src={thumbnailUrl}
              className="absolute inset-0 w-full h-full object-fill!"
              alt=""
              animate={{
                rotate: isPlaying ? 360 : 0,
              }}
              transition={{
                duration: 28,
                ease: "linear",
                repeat: Infinity,
              }}
            />
          )}

          <div
            style={{ zIndex: 9 }}
            className={`w-7 h-7 flex items-center justify-center overflow-hidden rounded-full ${isPlaying ? "text-(--primary-color)" : "text-(--text-color)"} ${thumbnailUrl ? "bg-(--background-color)" : ""}`}
          >
            <i
              className={clsx("material-symbols-outlined filled leading-none", {
                "text-3xl!": thumbnailUrl,
                "text-4xl!": !thumbnailUrl,
              })}
            >
              {isPlaying ? "pause" : "play_arrow"}
            </i>
          </div>
        </button>

        <div className="flex flex-col gap-2 flex-1 min-w-0 cursor-pointer">
          {isDisplayName && (
            <div
              className="flex items-center hover:opacity-80 min-w-0"
              onClick={handleOpenModal}
            >
              <h1
                className={clsx(
                  "truncate whitespace-nowrap min-w-0",
                  isCompact && "text-xs",
                )}
                title={fileName}
              >
                {fileName || "Audio file"}
              </h1>
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
            <source src={mediaUrl} type={getAudioType(fileName || "")} />
            Your browser does not support the audio element.
          </audio>

          {!isCompact && (
            <div className="flex items-center justify-between gap-2">
              <input
                type="range"
                value={progress}
                onChange={handleSeek}
                className="w-full h-1 rounded-full! cursor-pointer appearance-none custom-slider"
                style={{
                  background: `linear-gradient(to right, var(--primary-green-glow) ${progress}%, gray ${progress}%)`,
                }}
              />
              <div className="flex text-xs opacity-50 whitespace-nowrap shrink-0">
                {currentTime > 0 && (
                  <span>
                    {formatDuration(currentTime)}
                    <span className="px-0.5">/</span>
                  </span>
                )}
                {duration > 0 && formatDuration(duration)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default CustomAudioPlayer;
