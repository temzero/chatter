import {
  useRef,
  forwardRef,
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
} from "react";
import WaveSurfer from "wavesurfer.js";
import { formatDuration } from "@/common/utils/format/formatDuration";
import mediaManager from "@/services/media/mediaManager";

const PROGRESS_COLOR = "rgb(134, 239, 172)"; // green
const WAVE_COLOR = "#555";

interface AudioVoicePlayerProps {
  mediaUrl: string;
  fileName?: string;
  goNext?: () => void;
}

export interface AudioPlayerRef {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
}

interface SkipButtonConfig {
  seconds: number;
  label: string;
  icon: string;
  ariaLabel: string;
  title: string;
}

const CustomAudioVoicePlayer = forwardRef<
  AudioPlayerRef,
  AudioVoicePlayerProps
>(({ mediaUrl, fileName, goNext }, ref) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const waveSurferRef = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  /* -------------------- INIT WAVESURFER -------------------- */
  useEffect(() => {
    if (!waveformRef.current) return;

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      url: mediaUrl,
      height: 120,
      barWidth: 3,
      barGap: 5,
      barRadius: 3,
      cursorWidth: 3,
      normalize: true,
      waveColor: WAVE_COLOR,
      progressColor: PROGRESS_COLOR,
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
  }, [mediaUrl, goNext]);

  /* -------------------- CONTROLS -------------------- */
  const togglePlayPause = useCallback(() => {
    const ws = waveSurferRef.current;
    if (!ws) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    ws.isPlaying() ? ws.pause() : ws.play();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
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
    }),
    [togglePlayPause],
  );

  const skipTime = useCallback((seconds: number) => {
    const ws = waveSurferRef.current;
    if (!ws) return;

    const newTime = Math.max(
      0,
      Math.min(ws.getCurrentTime() + seconds, ws.getDuration()),
    );

    ws.setTime(newTime);
    setCurrentTime(newTime);
  }, []);

  /* -------------------- UI HELPERS -------------------- */
  const skipForwardButtons: SkipButtonConfig[] = [
    {
      seconds: 5,
      label: "Skip forward 5s",
      icon: "forward_5",
      ariaLabel: "Skip forward 5 seconds",
      title: "Skip forward 5 seconds",
    },
    {
      seconds: 30,
      label: "Skip forward 30s",
      icon: "forward_30",
      ariaLabel: "Skip forward 30 seconds",
      title: "Skip forward 30 seconds",
    },
  ];

  const skipBackwardButtons: SkipButtonConfig[] = [
    {
      seconds: -5,
      label: "Skip back 5s",
      icon: "replay_5",
      ariaLabel: "Skip back 5 seconds",
      title: "Skip back 5 seconds",
    },
    {
      seconds: -30,
      label: "Skip back 30s",
      icon: "replay_30",
      ariaLabel: "Skip back 30 seconds",
      title: "Skip back 30 seconds",
    },
  ];

  const renderSkipButton = (config: SkipButtonConfig) => (
    <button
      key={config.label}
      onClick={() => skipTime(config.seconds)}
      className="w-14 h-14 rounded-full! flex items-center justify-center bg-black/50 text-white transition-colors"
      aria-label={config.ariaLabel}
      title={config.title}
    >
      <span className="material-symbols-outlined text-5xl!">{config.icon}</span>
    </button>
  );

  const displayName = fileName?.replace(/\.[^/.]+$/, "") || "Voice message";

  /* -------------------- RENDER -------------------- */
  return (
    <div className="flex flex-col justify-between gap-4 h-[80%] w-[60%]">
      {/* Header */}
      <div className="w-full flex flex-col items-center justify-center">
        <span className={`material-symbols-outlined filled text-7xl!`}>
          mic
        </span>

        {fileName && (
          <div className="truncate select-text" title={fileName}>
            {displayName}
          </div>
        )}
      </div>

      {/* Waveform */}
      <div ref={waveformRef} className="w-full cursor-pointer" />

      {/* Time */}
      <div className="text-3xl! whitespace-nowrap w-full flex justify-center mb-6 select-text leading-none">
        {formatDuration(currentTime)} / {formatDuration(duration)}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-6 items-center">
        <div className="flex gap-2">
          {skipBackwardButtons.map(renderSkipButton)}
        </div>

        <button
          onClick={togglePlayPause}
          className={`relative w-16 h-16 rounded-full! text-(--background-color)
            flex items-center justify-center
            hover:opacity-80 border border-(--border-color)
            ${isPlaying ? "bg-(--primary-color)" : "bg-(--text-color)"}`}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          <i className="material-symbols-outlined filled text-6xl!">
            {isPlaying ? "pause" : "play_arrow"}
          </i>
        </button>

        <div className="flex gap-2">
          {skipForwardButtons.map(renderSkipButton)}
        </div>
      </div>
    </div>
  );
});

export default CustomAudioVoicePlayer;
