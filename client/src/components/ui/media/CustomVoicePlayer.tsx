import { forwardRef, useImperativeHandle } from "react";
import clsx from "clsx";
import { setOpenMediaModal } from "@/stores/modalStore";
import { useAudioPlayer } from "@/common/hooks/useAudioPlayer";
import AudioWaveform from "../streams/AudioWaveform";
import PlayTimeDisplay from "../PlayTimeDisplay";

interface CustomVoicePlayerProps {
  attachmentId: string;
  mediaUrl: string;
  fileName?: string;
  showDuration?: boolean;
  className?: string;
}

export interface VoicePlayerRef {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
}

const CustomVoicePlayer = forwardRef<VoicePlayerRef, CustomVoicePlayerProps>(
  (
    { attachmentId, mediaUrl, fileName, showDuration = true, className },
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

    const getSenderName = (fileName?: string) => {
      if (!fileName) return "";
      // Remove file extension first
      const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
      // Try splitting by hyphen first, then by dot
      const parts = nameWithoutExt.split("-");
      if (parts.length > 1) {
        return parts[0];
      }
      // If no hyphen, split by dot
      const dotParts = nameWithoutExt.split(".");
      if (dotParts.length > 1) {
        return dotParts[0];
      }
      // If no separators found, return the full name without extension
      return nameWithoutExt;
    };

    // Example usage:
    const senderName = getSenderName(fileName); // "Nhan"

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

    // const handleOpenModal = () => {
    //   setOpenMediaModal(attachmentId, currentTime);
    // };

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

    return (
      <div
        key={attachmentId}
        onClick={handleOpenModal}
        className={clsx(
          className,
          "flex flex-1 p-1 items-center min-w-(--sidebar-width)",
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          className={clsx(
            "relative w-10 h-10 rounded-full!",
            "ml-1 mr-2 shrink-0 flex items-center justify-center",
            "overflow-hidden hover:opacity-70 border-2 border-(--input-border-color) bg-(--glass-panel-color)",
          )}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          <i className="material-symbols-outlined filled text-4xl!">
            {isPlaying ? "pause" : "play_arrow"}
          </i>
        </button>

        <div className="relative flex flex-col w-full h-12">
          {senderName && (
            <h1 className="absolute top-0 left-0 opacity-70 text-sm! italic">
              {senderName}
            </h1>
          )}

          <AudioWaveform
            mediaUrl={mediaUrl}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            height={48}
            barCount={120}
            barSpacing={1}
            onSeek={seekTo}
          />

          {showDuration && duration > 1 && (
            <PlayTimeDisplay
              currentTime={currentTime}
              duration={duration}
              onClick={handleOpenModal}
              className={clsx(
                // base
                "absolute -top-0.5 -right-0.5 shrink-0 whitespace-nowrap rounded-lg px-1 py-0.5 text-sm font-semibold cursor-pointer",
                "bg-black/30 text-white backdrop-blur-xl",
                "transition-all",
                // hover
                "hover:text-lg hover:font-bold",
                "hover:custom-border hover:bg-(--primary-green-glow) hover:text-black",
              )}
            />
          )}
        </div>

        {/* AUDIO ELEMENT INSIDE COMPONENT */}
        <audio
          ref={audioRef}
          src={mediaUrl}
          preload="metadata"
          style={{ display: "none" }}
        />
      </div>
    );
  },
);

export default CustomVoicePlayer;
