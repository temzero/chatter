import { forwardRef, useImperativeHandle, useCallback } from "react";
import { useAudioPlayer } from "@/common/hooks/useAudioPlayer";
import AudioWaveform from "../streams/AudioWaveform";
import PlayTimeDisplay from "../PlayTimeDisplay";

interface AudioVoicePlayerProps {
  mediaUrl: string;
  fileName?: string;
  initCurrentTime?: number;
  goNext?: () => void;
}

export interface AudioPlayerRef {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
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
>(({ mediaUrl, fileName, initCurrentTime = 0, goNext }, ref) => {
  const {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    togglePlayPause,
    seekTo,
    setDuration,
    setCurrentTime,
    setIsPlaying,
  } = useAudioPlayer({
    onEnded: goNext,
    initialCurrentTime: initCurrentTime,
  });
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

  // -------------------- Event Handlers --------------------
  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      if (initCurrentTime > 0) {
        audioRef.current.currentTime = initCurrentTime;
        setCurrentTime(initCurrentTime);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initCurrentTime]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (goNext) goNext();
  }, [goNext, setCurrentTime, setIsPlaying]);

  // -------------------- Controls --------------------
  const skipTime = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // -------------------- UI Config --------------------
  // Define all possible skip forward buttons
  const allSkipForwardButtons: SkipButtonConfig[] = [
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

  // Define all possible skip backward buttons
  const allSkipBackwardButtons: SkipButtonConfig[] = [
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

  // Filter buttons based on duration
  const skipForwardButtons = allSkipForwardButtons.filter((button) => {
    if (button.seconds === 30) {
      return duration > 30; // Only show 30s button if duration > 30s
    }
    if (button.seconds === 5) {
      return duration > 5; // Only show 5s button if duration > 5s
    }
    return true;
  });

  const skipBackwardButtons = allSkipBackwardButtons.filter((button) => {
    if (button.seconds === -30) {
      return duration > 30; // Only show 30s button if duration > 30s
    }
    if (button.seconds === -5) {
      return duration > 5; // Only show 5s button if duration > 5s
    }
    return true;
  });

  const renderSkipButton = (config: SkipButtonConfig) => (
    <button
      key={config.label}
      onClick={() => skipTime(config.seconds)}
      className="w-14 h-14 rounded-full! flex items-center justify-center bg-black/50 text-white hover:text-(--primary-green-glow) hover:bg-black/70 transition-colors"
      aria-label={config.ariaLabel}
      title={config.title}
    >
      <span className="material-symbols-outlined text-5xl!">{config.icon}</span>
    </button>
  );

  // const displayName = fileName?.replace(/\.[^/.]+$/, "") || "Voice message";

  // -------------------- RENDER --------------------
  return (
    <div className="flex flex-col justify-between gap-4 h-[80%] w-[60%]">
      {/* Header */}
      <div
        title={fileName}
        className="w-full flex flex-col items-center justify-center"
      >
        <span className="material-symbols-outlined filled text-7xl!">mic</span>
        {/* {fileName && (
          <div className="truncate select-text mt-2" title={fileName}>
            {displayName}
          </div>
        )} */}
      </div>

      {/* AudioWave Visualizer - NO ref */}
      <div className="w-full h-48">
        <AudioWaveform
          mediaUrl={mediaUrl}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration} // Pass duration to visualizer
          height={192}
          color="#00ffaa"
          onSeek={seekTo}
        />
      </div>

      {/* Time Display */}
      <PlayTimeDisplay
        currentTime={currentTime}
        duration={duration}
        className="text-3xl!"
      />

      {/* Controls */}
      <div className="flex justify-center gap-6 items-center">
        <div className="flex gap-2">
          {skipBackwardButtons.map(renderSkipButton)}
        </div>

        <button
          onClick={togglePlayPause}
          className={`relative w-16 h-16 rounded-full! text-white hover:text-(--primary-green-glow)
            flex items-center justify-center hover:opacity-90 
            transition-all duration-200 bg-black/50`}
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

      {/* SINGLE Audio Element */}
      <audio
        ref={audioRef}
        src={mediaUrl}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
    </div>
  );
});

export default CustomAudioVoicePlayer;
