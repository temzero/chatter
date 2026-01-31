import clsx from "clsx";
import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useCallback,
} from "react";
import WaveSurfer from "wavesurfer.js";
import { formatDuration } from "@/common/utils/format/formatDuration";
import mediaManager from "@/services/media/mediaManager";

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

const PROGRESS_COLOR = "rgb(134, 239, 172)"; // green
const WAVE_COLOR = "#555";

const CustomVoicePlayer = forwardRef<VoicePlayerRef, CustomVoicePlayerProps>(
  ({ mediaUrl, showDuration = true, onOpenModal }, ref) => {
    const waveformRef = useRef<HTMLDivElement>(null);
    const waveSurferRef = useRef<WaveSurfer | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    /* -------------------- WAVESURFER INIT -------------------- */
    useEffect(() => {
      if (!waveformRef.current) return;

      const ws = WaveSurfer.create({
        container: waveformRef.current,
        height: 32, // This controls the waveform height
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        cursorWidth: 1,
        cursorColor: PROGRESS_COLOR,
        normalize: true,
        waveColor: WAVE_COLOR,
        progressColor: PROGRESS_COLOR,
        url: mediaUrl,
        interact: true,
        dragToSeek: true,
      });

      waveSurferRef.current = ws;

      ws.on("ready", () => {
        setDuration(ws.getDuration());
      });

      ws.on("timeupdate", (time) => {
        setCurrentTime(time);
      });

      ws.on("play", () => {
        setIsPlaying(true);
        // Register with mediaManager when WaveSurfer starts playing
        mediaManager.play(ws);
      });

      ws.on("pause", () => {
        setIsPlaying(false);
        // Remove from mediaManager when paused
        if (mediaManager) {
          // We'll handle this in togglePlayPause instead
        }
      });

      ws.on("finish", () => {
        setIsPlaying(false);
        ws.seekTo(0);
      });

      return () => {
        ws.destroy();
        waveSurferRef.current = null;
      };
    }, [mediaUrl]);

    const togglePlayPause = useCallback(
      (e?: React.MouseEvent<HTMLButtonElement>) => {
        e?.stopPropagation();
        const ws = waveSurferRef.current;
        if (!ws) return;

        if (isPlaying) {
          ws.pause();
        } else {
          ws.play();
        }
      },
      [isPlaying],
    );

    useImperativeHandle(ref, () => ({
      play: () => {
        const ws = waveSurferRef.current;
        if (ws) {
          mediaManager.play(ws);
          ws.play();
          setIsPlaying(true);
        }
      },
      pause: () => {
        const ws = waveSurferRef.current;
        if (ws) {
          mediaManager.stop(ws);
          ws.pause();
          setIsPlaying(false);
        }
      },
      togglePlayPause,
    }));

    /* -------------------- RENDER -------------------- */
    return (
      <div
        className={clsx(
          "w-full flex items-center p-2 min-w-[300px] custom-border-b",
          // "h-16", // Fixed overall height
        )}
      >
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className={clsx(
            "relative rounded-full!",
            "overflow-hidden hover:opacity-70 border-2 border-(--input-border-color)",
            "w-10 h-10 shrink-0 flex items-center justify-center",
          )}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          <i className="material-symbols-outlined filled text-3xl!">
            {isPlaying ? "pause" : "play_arrow"}
          </i>
        </button>



        <div className="flex flex-col w-full ml-3 relative">
          {/* Waveform Container - FIXED with CSS */}
          <div
          ref={waveformRef}
          className="w-full cursor-pointer border relative"
          // style={{
          //   height: "32px", // Fixed height that matches WaveSurfer height
          //   minHeight: "32px",
          //   maxHeight: "32px",
          //   // overflow: "hidden", // Prevent any overflow
          // }}
        />

          {/* Duration Display */}
          {showDuration && (
            <div
              onClick={onOpenModal}
              className="text-xs opacity-50 whitespace-nowrap shrink-0 hover:opacity-100 cursor-pointer select-none mt-1"
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
        </div>
      </div>
    );
  },
);

export default CustomVoicePlayer;
