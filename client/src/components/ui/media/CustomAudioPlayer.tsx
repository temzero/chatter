import clsx from "clsx";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { formatDuration } from "@/common/utils/format/formatDuration";
import mediaManager from "@/services/media/mediaManager";

interface CustomAudioPlayerProps {
  mediaUrl: string;
  attachmentType: AttachmentType.AUDIO | AttachmentType.VOICE;
  thumbnailUrl?: string;
  fileName?: string;
  isDisplayName?: boolean;
  type?: string;
  isCompact?: boolean;
  onOpenModal?: () => void;
}

export interface AudioPlayerRef {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
}

const CustomAudioPlayer = forwardRef<AudioPlayerRef, CustomAudioPlayerProps>(
  (
    {
      mediaUrl,
      attachmentType,
      thumbnailUrl,
      fileName,
      isDisplayName = true,
      isCompact = false,
      onOpenModal,
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

    return (
      <div
        className={clsx(
          "w-full p-2 flex items-center custom-border-b overflow-hidden",
          isCompact ? "max-w-60px" : "gap-1",
        )}
      >
        {/* <button
          onClick={togglePlayPause}
          className={clsx(
            "relative overflow-hidden hover:opacity-70 w-12 h-12", // Added truncate, whitespace-nowrap, min-w-0
            thumbnailUrl &&
              "rounded-lg! border-2 border-(--input-border-color)",
          )}
          style={{
            backgroundImage: `url(${thumbnailUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <i
            className={clsx(
              "material-symbols-outlined",
              isCompact ? "text-3xl!" : "text-4xl!",
            )}
            style={{ zIndex: 1 }}
          >
            {isPlaying ? "pause_circle" : "play_circle"}
          </i>
        </button> */}
        <button
          onClick={togglePlayPause}
          className={clsx(
            "relative w-12 h-12 rounded-full!",
            "overflow-hidden hover:opacity-70 w-12 h-12 border-2 border-(--input-border-color)",
          )}
        >
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              className="absolute inset-0 w-full h-full object-fill!"
              alt=""
            />
          )}

          <i
            className={clsx(
              "material-symbols-outlined filled relative hover:text-(--primary-color) z-10",
              isCompact ? "text-3xl!" : "text-4xl!",
            )}
          >
            {isPlaying ? "pause" : "play_arrow"}
          </i>
        </button>

        <div className="flex flex-col gap-2 flex-1 min-w-0 cursor-pointer">
          {isDisplayName && (
            <div
              className="flex items-center hover:opacity-80 min-w-0" // Added min-w-0
              onClick={onOpenModal}
            >
              {/* {attachmentType === AttachmentType.AUDIO && (
                <i
                  className={clsx(
                    "material-symbols-outlined shrink-0", // Added flex-shrink-0
                    isCompact && "text-xl!",
                  )}
                >
                  music_note
                </i>
              )} */}
              <h1
                className={clsx(
                  "truncate whitespace-nowrap min-w-0", // Added truncate, whitespace-nowrap, min-w-0
                  isCompact && "text-xs",
                )}
                title={fileName} // Add title for tooltip on hover
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
                  background: `linear-gradient(to right, var(--primary-green) ${progress}%, gray ${progress}%)`,
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

const getAudioType = (fileName: string) => {
  if (fileName.endsWith(".mp3")) return "audio/mpeg";
  if (fileName.endsWith(".m4a")) return "audio/x-m4a";
  if (fileName.endsWith(".wav")) return "audio/wav";
  if (fileName.endsWith(".ogg")) return "audio/ogg";
  return "audio/mpeg";
};

export default CustomAudioPlayer;
