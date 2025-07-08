import { AttachmentType } from "@/types/enums/attachmentType";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";

interface CustomAudioPlayerProps {
  mediaUrl: string;
  fileName?: string;
  attachmentType: AttachmentType;
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

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      play: () => {
        if (audioRef.current) {
          audioRef.current.play();
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
            audioRef.current.play();
            setIsPlaying(true);
          }
        }
      },
    }));

    const togglePlayPause = () => {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
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
          {isDisplayName && <div className="flex gap-2">
            {attachmentType && attachmentType === AttachmentType.AUDIO ? (
              <i className="material-symbols-outlined">music_note</i>
            ) : (
              ""
            )}
            <h1 className="truncate">{fileName || "Audio file"}</h1>
          </div>}

          <audio
            ref={audioRef}
            className="hidden" // hide native audio element
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleTimeUpdate}
          >
            <source src={mediaUrl} type={getAudioType(fileName || "")} />
            Your browser does not support the audio element.
          </audio>

          {/* Range input styled to stay within parent */}
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
  return "audio/mpeg"; // Fallback to mp3 type if unknown
};

export default CustomAudioPlayer;
