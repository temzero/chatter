import {
  forwardRef,
  useImperativeHandle,
} from "react";
import clsx from "clsx";
import { formatDuration } from "@/common/utils/format/formatDuration";
import AudioWaveVisualizer from "../AudioWaveVisualizer";
import { setOpenMediaModal } from "@/stores/modalStore";
import { useAudioPlayer } from "@/common/hooks/useAudioPlayer";

interface CustomVoicePlayerProps {
  attachmentId: string;
  mediaUrl: string;
  fileName?: string;
  showDuration?: boolean;
}

export interface VoicePlayerRef {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
}

const CustomVoicePlayer = forwardRef<VoicePlayerRef, CustomVoicePlayerProps>(
  ({ attachmentId, mediaUrl, showDuration = true }, ref) => {
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

    const handleOpenModal = () => {
      setOpenMediaModal(attachmentId, currentTime);
    };

    console.log('RENDER VOICE ATTACHMENT')

    return (
      <div
        key={attachmentId}
        onClick={handleOpenModal}
        className={clsx("w-[400px] flex p-1 items-center")}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            togglePlayPause();
          }}
          className={clsx(
            "relative rounded-full!",
            "overflow-hidden hover:opacity-70 border-2 border-(--input-border-color) bg-(--border-color)",
            "w-10 h-10 ml-1 mr-2 shrink-0 flex items-center justify-center",
          )}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          <i className="material-symbols-outlined filled text-4xl!">
            {isPlaying ? "pause" : "play_arrow"}
          </i>
        </button>

        <div className="relative flex flex-col w-[400px] h-12">
          <AudioWaveVisualizer
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
            <div
              onClick={handleOpenModal}
              className={clsx(
                // base
                "absolute -bottom-0.5 -right-0.5 shrink-0 whitespace-nowrap rounded-lg px-1 py-0.5 text-sm font-semibold",
                "bg-black/30 text-white backdrop-blur-xl",
                "transition-all",

                // hover
                "hover:text-lg hover:font-bold",
                "hover:custom-border hover:bg-(--primary-green-glow) hover:text-black",
              )}
            >
              {currentTime > 0 && (
                <span>
                  {formatDuration(currentTime)}
                  <span className="px-0.5">/</span>
                </span>
              )}
              {duration > 0 ? formatDuration(duration) : "--:--"}
            </div>
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
