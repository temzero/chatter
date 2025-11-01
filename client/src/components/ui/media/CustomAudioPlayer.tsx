import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { formatDuration } from "@/common/utils/format/formatDuration";
import clsx from "clsx";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";

// Audio manager
let currentAudio: HTMLAudioElement | null = null;

const playAudio = (audioElement: HTMLAudioElement) => {
  if (currentAudio && currentAudio !== audioElement) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.dispatchEvent(new Event("pause"));
  }
  currentAudio = audioElement;
  audioElement.play();
};

const stopCurrentAudio = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};

interface CustomAudioPlayerProps {
  mediaUrl: string;
  fileName?: string;
  attachmentType: AttachmentType.AUDIO | AttachmentType.VOICE;
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
      fileName,
      attachmentType,
      isDisplayName = true,
      isCompact = false,
      onOpenModal,
    },
    ref
  ) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const durationRef = useRef(0);

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        durationRef.current = audioRef.current.duration;
        handleTimeUpdate(); // update progress and currentTime after duration is known
      }
    };

    useEffect(() => {
      const handleExternalPause = () => setIsPlaying(false);
      const audioElement = audioRef.current;
      if (audioElement) {
        audioElement.addEventListener("pause", handleExternalPause);
      }
      return () => {
        if (audioElement) {
          audioElement.removeEventListener("pause", handleExternalPause);
          if (currentAudio === audioElement) stopCurrentAudio();
          audioElement.pause();
        }
      };
    }, []);

    useImperativeHandle(ref, () => ({
      play: () => {
        if (audioRef.current) {
          playAudio(audioRef.current);
          setIsPlaying(true);
        }
      },
      pause: () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      },
      togglePlayPause: () => {
        if (!audioRef.current) return;
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          playAudio(audioRef.current);
          setIsPlaying(true);
        }
      },
    }));

    const togglePlayPause = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        playAudio(audioRef.current);
        setIsPlaying(true);
      }
    };

    const handleTimeUpdate = () => {
      if (!audioRef.current) return;
      const current = audioRef.current.currentTime;
      const dur = audioRef.current.duration || durationRef.current;
      setCurrentTime(current);
      setProgress((current / dur) * 100);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (audioRef.current) {
        const newTime = (Number(e.target.value) / 100) * durationRef.current;
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
        setProgress(Number(e.target.value));
      }
    };

    return (
      <div
        className={clsx(
          "w-full p-2 flex items-center custom-border-b overflow-hidden",
          isCompact ? "max-w-60px" : "gap-1"
        )}
      >
        <button
          onClick={togglePlayPause}
          className="rounded-full hover:opacity-70"
        >
          <i
            className={clsx(
              "material-symbols-outlined",
              isCompact ? "text-3xl" : "text-4xl"
            )}
          >
            {isPlaying ? "pause_circle" : "play_circle"}
          </i>
        </button>

        <div className="flex flex-col gap-2 flex-1 min-w-0 cursor-pointer">
          {isDisplayName && (
            <div
              className="flex items-center hover:opacity-80"
              onClick={onOpenModal}
            >
              {attachmentType === AttachmentType.AUDIO && (
                <i
                  className={clsx(
                    "material-symbols-outlined",
                    isCompact && "text-xl"
                  )}
                >
                  music_note
                </i>
              )}
              <h1 className={clsx("truncate", isCompact && "text-xs")}>
                {fileName || "Audio file"}
              </h1>
            </div>
          )}

          <audio
            ref={audioRef}
            className="hidden"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPause={() => {
              if (audioRef.current !== currentAudio) setIsPlaying(false);
            }}
            onEnded={() => {
              setIsPlaying(false);
              if (audioRef.current === currentAudio) currentAudio = null;
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
                className="w-full h-1 rounded-full cursor-pointer appearance-none custom-slider"
                style={{
                  background: `linear-gradient(to right, var(--primary-green) ${progress}%, gray ${progress}%)`,
                }}
              />
              <div className="flex text-xs opacity-50 whitespace-nowrap">
                {currentTime > 0 && (
                  <span>
                    {formatDuration(currentTime)}
                    <span className="px-0.5">/</span>
                  </span>
                )}
                {durationRef.current > 0 && formatDuration(durationRef.current)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

const getAudioType = (fileName: string) => {
  if (fileName.endsWith(".mp3")) return "audio/mpeg";
  if (fileName.endsWith(".m4a")) return "audio/x-m4a";
  if (fileName.endsWith(".wav")) return "audio/wav";
  if (fileName.endsWith(".ogg")) return "audio/ogg";
  return "audio/mpeg";
};

export default CustomAudioPlayer;
