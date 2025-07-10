import { AttachmentType } from "@/types/enums/attachmentType";
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
  // Pause the currently playing audio if it exists
  if (currentAudio && currentAudio !== audioElement) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    // Dispatch pause event to sync other players
    const event = new Event('pause');
    currentAudio.dispatchEvent(event);
  }

  // Set the new audio as current and play it
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
}

export interface AudioPlayerRef {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
}

const CustomAudioPlayer = forwardRef<AudioPlayerRef, CustomAudioPlayerProps>(
  ({ mediaUrl, fileName, attachmentType, isDisplayName = true }, ref) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    // Handle play/pause events from other audio players
    useEffect(() => {
      const handleExternalPause = () => {
        setIsPlaying(false);
      };

      const audioElement = audioRef.current;
      if (audioElement) {
        audioElement.addEventListener('pause', handleExternalPause);
      }

      return () => {
        if (audioElement) {
          audioElement.removeEventListener('pause', handleExternalPause);
          if (currentAudio === audioElement) {
            stopCurrentAudio();
          }
          audioElement.pause();
        }
      };
    }, []);

    // Expose methods to parent via ref
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

    const togglePlayPause = () => {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          playAudio(audioRef.current);
          setIsPlaying(true);
        }
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
        const newTime: number =
          (Number(e.target.value) / 100) * audioRef.current.duration;
        audioRef.current.currentTime = newTime;
      }
    };

    return (
      <div className="w-full p-2 py-3 flex items-center gap-1 custom-border-b overflow-hidden">
        <button
          onClick={togglePlayPause}
          className="rounded-full hover:opacity-70"
        >
          {isPlaying ? (
            <i className="material-symbols-outlined text-4xl">pause_circle</i>
          ) : (
            <i className="material-symbols-outlined text-4xl">play_circle</i>
          )}
        </button>

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {isDisplayName && <div className="flex items-center">
            {attachmentType && attachmentType === AttachmentType.AUDIO ? (
              <i className="material-symbols-outlined">music_note</i>
            ) : (
              ""
            )}
            <h1 className="truncate">{fileName || "Audio file"}</h1>
          </div>}

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

          <input
            type="range"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1 rounded-full cursor-pointer appearance-none custom-slider"
            style={{
              background: `linear-gradient(to right, blue ${progress}%, gray ${progress}%)`,
            }}
          />
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