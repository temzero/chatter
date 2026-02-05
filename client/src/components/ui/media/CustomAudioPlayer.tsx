import clsx from "clsx";
import React, { forwardRef, useImperativeHandle } from "react";
import { setOpenMediaModal } from "@/stores/modalStore";
import { useAudioPlayer } from "@/common/hooks/useAudioPlayer";
import { getAudioType } from "@/common/utils/getAudioType";
import { motion } from "framer-motion";
import musicDiskCover from "@/assets/image/disk.png";
import PlayTimeDisplay from "../PlayTimeDisplay";

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
  seekTo: (time: number) => void;
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
    const {
      audioRef,
      isPlaying,
      currentTime,
      duration,
      play,
      pause,
      togglePlayPause,
      seekTo,
    } = useAudioPlayer();

    // Expose methods to parent ref
    useImperativeHandle(
      ref,
      () => ({
        play,
        pause,
        togglePlayPause,
        seekTo,
        get audioElement() {
          return audioRef.current;
        },
      }),
      [play, pause, togglePlayPause, seekTo, audioRef],
    );

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = (Number(e.target.value) / 100) * duration;
      seekTo(newTime);
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    const handleOpenModal = () => {
      // Pass currentTime to modal (so it continues playing from there)
      setOpenMediaModal(attachmentId, currentTime);

      // Stop and reset the mini player to 0
      if (isPlaying) {
        pause();
      }

      // Reset mini player position to 0
      seekTo(0);
    };

    const handleTogglePlayPause = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      togglePlayPause();
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
          onClick={handleTogglePlayPause}
          className={clsx(
            "relative aspect-square rounded-full!",
            "overflow-hidden hover:opacity-70 bg-(--glass-panel-color)",
            {
              "w-12 h-12": thumbnailUrl,
              "w-10 h-10": !thumbnailUrl,
            },
          )}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {thumbnailUrl && (
            <motion.img
              src={thumbnailUrl || musicDiskCover}
              className="absolute inset-0 w-full h-full object-fill!"
              loading="lazy"
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
            style={{ zIndex: 1 }}
            className={`flex items-center justify-center overflow-hidden rounded-full border-2 border-(--input-border-color) ${thumbnailUrl ? "bg-(--background-color)" : ""}`}
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

          <audio ref={audioRef} className="hidden" preload="metadata">
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
              <PlayTimeDisplay
                currentTime={currentTime}
                duration={duration}
                className="text-xs opacity-50"
              />
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default CustomAudioPlayer;
