import { AttachmentType } from "@/types/enums/attachmentType";
import clsx from "clsx";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";

// Audio manager implementation
let currentAudio: HTMLAudioElement | null = null;

const playAudio = (audioElement: HTMLAudioElement) => {
  if (currentAudio && currentAudio !== audioElement) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    const event = new Event("pause");
    currentAudio.dispatchEvent(event);
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
    },
    ref
  ) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

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
        if (audioRef.current) {
          if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
          } else {
            playAudio(audioRef.current);
            setIsPlaying(true);
          }
        }
      },
    }));

    const togglePlayPause = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
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
      if (audioRef.current) {
        setProgress(
          (audioRef.current.currentTime / audioRef.current.duration) * 100
        );
      }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (audioRef.current) {
        const newTime =
          (Number(e.target.value) / 100) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
      }
    };

    return (
      <div
        className={clsx(
          "w-full p-2 pl-0.5 flex items-center custom-border-b overflow-hidden",
          isCompact ? "max-w-60px" : "gap-1"
        )}
      >
        <button
          onClick={(e) => togglePlayPause(e)}
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

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {isDisplayName && (
            <div className="flex items-center">
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
            onLoadedMetadata={handleTimeUpdate}
            onPause={() => {
              if (audioRef.current !== currentAudio) {
                setIsPlaying(false);
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              if (audioRef.current === currentAudio) {
                currentAudio = null;
              }
            }}
          >
            <source src={mediaUrl} type={getAudioType(fileName || "")} />
            Your browser does not support the audio element.
          </audio>

          {!isCompact && (
            <input
              type="range"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 rounded-full cursor-pointer appearance-none custom-slider"
              style={{
                background: `linear-gradient(to right, blue ${progress}%, gray ${progress}%)`,
              }}
            />
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
