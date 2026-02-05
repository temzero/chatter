import {
  useRef,
  forwardRef,
  useImperativeHandle,
  useReducer,
  useMemo,
  useState,
  useCallback,
  memo,
  useEffect,
} from "react";
import { useIsMobile } from "@/stores/deviceStore";
import { useAudioDiskDrag } from "@/common/hooks/keyEvent/useAudioDiskDrag";
import musicDiskCover from "@/assets/image/disk.png";
import mediaManager from "@/services/media/mediaManager";
import PlayTimeDisplay from "../PlayTimeDisplay";

// -------------------- useReducer --------------------
interface AudioState {
  isPlaying: boolean;
  currentTime: number;
  progress: number;
  duration: number;
}

type AudioAction =
  | { type: "play" }
  | { type: "pause" }
  | { type: "setTime"; payload: number }
  | { type: "setDuration"; payload: number }
  | { type: "reset" };

const initialState: AudioState = {
  isPlaying: false,
  currentTime: 0,
  progress: 0,
  duration: 0,
};

function audioReducer(state: AudioState, action: AudioAction): AudioState {
  switch (action.type) {
    case "play":
      return { ...state, isPlaying: true };
    case "pause":
      return { ...state, isPlaying: false };
    case "setTime": {
      const progress = state.duration
        ? (action.payload / state.duration) * 100
        : 0;
      return { ...state, currentTime: action.payload, progress };
    }
    case "setDuration":
      return { ...state, duration: action.payload };
    case "reset":
      return { ...state, isPlaying: false, currentTime: 0, progress: 0 };
    default:
      return state;
  }
}

// =============== FIXED: Keep diskRef accessible ===============
interface DiskVisualProps {
  diskRef: React.RefObject<HTMLDivElement | null>;
  diskSize: number;
  progress: number;
  isPlaying: boolean;
  isDraggingState: boolean;
  diskHoleSize: number;
  cdImageUrl?: string;
  fileName?: string;
  processedFileName: string;
  onDragStart: (clientX: number, clientY: number) => void;
}

// Add this BEFORE DiskVisual component
const FileNameSVG = memo(({ fileName }: { fileName: string }) => (
  <svg className="absolute w-full h-full" viewBox="0 0 200 200">
    <defs>
      <path
        id="circlePath"
        d="M100,100 m0,-85 a85,85 0 1,1 0,170 a85,85 0 1,1 0,-170"
      />
    </defs>
    <text
      fill="white"
      stroke="black"
      strokeWidth="2"
      paintOrder="stroke"
      fontSize="12"
      fontWeight="semibold"
      textAnchor="start"
      transform="rotate(-90 100 100)"
    >
      <textPath href="#circlePath">{fileName}</textPath>
    </text>
  </svg>
));

const DiskVisual = memo(
  ({
    diskRef,
    diskSize,
    progress,
    isPlaying,
    isDraggingState,
    diskHoleSize,
    cdImageUrl,
    fileName,
    processedFileName,
    onDragStart,
  }: DiskVisualProps) => {
    const diskStyle = useMemo(
      () => ({
        width: diskSize,
        transform: `rotate(${(progress / 100) * 360}deg)`,
        transition:
          isPlaying && !isDraggingState ? "transform 0.1s linear" : "none",
        WebkitMaskImage: `radial-gradient(circle at center, transparent ${
          diskHoleSize / 2 - 1
        }px, black ${diskHoleSize / 2}px)`,
        maskImage: `radial-gradient(circle at center, transparent ${
          diskHoleSize / 2 - 1
        }px, black ${diskHoleSize / 2}px)`,
        WebkitMaskComposite: "source-in" as const,
        maskComposite: "intersect" as const,
      }),
      [diskSize, progress, isPlaying, isDraggingState, diskHoleSize],
    );

    return (
      <div
        id="disk"
        ref={diskRef} // =============== FIXED: Keep ref here ===============
        className="relative aspect-square rounded-full! overflow-hidden border-4 border-(--border-color) flex items-center justify-center text-white cursor-grab bg-(--panel-color) will-change-transform transform-gpu"
        style={diskStyle}
        onMouseDown={(e) => onDragStart(e.clientX, e.clientY)}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            const touch = e.touches[0];
            onDragStart(touch.clientX, touch.clientY);
          }
        }}
      >
        <img
          src={cdImageUrl ?? musicDiskCover}
          alt="CD"
          className="w-full h-full object-fill! rounded-full!"
          loading="lazy"
        />

        {fileName && <FileNameSVG fileName={processedFileName} />}

        <div
          id="duration-indicator"
          className="w-1 h-1 bg-red-500 absolute left-0 top-1/2 -translate-y-1/2"
        />
      </div>
    );
  },
);

interface DiskControlsProps {
  diskHoleSize: number;
  isPlaying: boolean;
  togglePlayPause: () => void;
}

const DiskControls = memo(
  ({ diskHoleSize, isPlaying, togglePlayPause }: DiskControlsProps) => (
    <>
      <button
        className="aspect-square absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full! border-16 border-(--border-color) outline-none"
        style={{ width: diskHoleSize, zIndex: 1 }}
        onClick={(e) => {
          e.stopPropagation();
          togglePlayPause();
        }}
      >
        <i className="material-symbols-outlined filled text-6xl! opacity-80 leading-none">
          {isPlaying ? "pause" : "play_arrow"}
        </i>
      </button>

      <div
        id="start-indicator"
        className="w-1 h-1 bg-red-500 absolute left-0 top-1/2 -translate-y-1/2"
      />
    </>
  ),
);

// -------------------- Component --------------------
interface AudioDiskPlayerProps {
  mediaUrl: string;
  fileName?: string;
  cdImageUrl?: string;
  initCurrentTime?: number;
  goNext?: () => void;
}

export interface AudioPlayerRef {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seekTo: (time: number) => void;
}

const CustomAudioDiskPlayer = forwardRef<AudioPlayerRef, AudioDiskPlayerProps>(
  ({ mediaUrl, fileName, cdImageUrl, initCurrentTime, goNext }, ref) => {
    const isMobile = useIsMobile();

    // toast.info(`initCurrentTime: ${initCurrentTime}`);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const diskRef = useRef<HTMLDivElement | null>(null);
    const logRef = useRef<NodeJS.Timeout | null>(null);

    // const initializedRef = useRef(false);

    // // Create a memoized function to show the initial toast
    // if (!initializedRef.current && initCurrentTime !== undefined) {
    //   toast.info(`initCurrentTime: ${initCurrentTime}`);
    //   initializedRef.current = true;
    // }

    const [state, dispatch] = useReducer(audioReducer, initialState);
    const [isDraggingState, setIsDraggingState] = useState(false);
    const isDragging = useRef(false);
    const lastAngle = useRef(0);

    const togglePlayPause = useCallback(() => {
      if (!audioRef.current) return;

      if (state.isPlaying) {
        mediaManager.stop(audioRef.current);
        dispatch({ type: "pause" });
      } else {
        mediaManager.play(audioRef.current);
        dispatch({ type: "play" });
      }
    }, [state.isPlaying]);

    // Add this function near your other handlers
    const seekTo = useCallback(
      (time: number) => {
        if (!audioRef.current) return;

        // Get current duration
        const currentDuration = audioRef.current.duration || state.duration;

        // Clamp time to valid range
        const clampedTime = Math.max(
          0,
          Math.min(time, currentDuration || Infinity),
        );

        // Seek the audio element
        audioRef.current.currentTime = clampedTime;

        // Update state
        dispatch({ type: "setTime", payload: clampedTime });
      },
      [state.duration],
    );

    // Then in useImperativeHandle:
    useImperativeHandle(
      ref,
      () => ({
        play: () => {
          if (audioRef.current) {
            mediaManager.play(audioRef.current);
            dispatch({ type: "play" });
          }
        },
        pause: () => {
          if (audioRef.current) {
            mediaManager.stop(audioRef.current);
            dispatch({ type: "pause" });
          }
        },
        togglePlayPause: () => togglePlayPause(),
        seekTo: seekTo, // Use the seekTo function
      }),
      [togglePlayPause, seekTo], // Add seekTo to dependencies
    );

    // -------------------- Handlers --------------------
    // const handleLoadedMetadata = useCallback(() => {
    //   if (audioRef.current) {
    //     dispatch({ type: "setDuration", payload: audioRef.current.duration });
    //   }
    // }, []);
    const handleLoadedMetadata = useCallback(() => {
      if (audioRef.current) {
        dispatch({ type: "setDuration", payload: audioRef.current.duration });

        // Set initial time if provided and > 3 seconds
        if (initCurrentTime !== undefined && initCurrentTime > 3) {
          // console.log("Setting audio start time to:", initCurrentTime);
          audioRef.current.currentTime = initCurrentTime;
          dispatch({ type: "setTime", payload: initCurrentTime });

          // Optional toast
          // toast.info(`Resumed from ${formatDuration(initCurrentTime)}`);
        }
      }
    }, [initCurrentTime]);

    const handleTimeUpdate = useCallback(() => {
      if (!audioRef.current) return;

      const currentTime = audioRef.current.currentTime;
      const progress = state.duration
        ? (currentTime / state.duration) * 100
        : 0;

      if (
        Math.abs(state.currentTime - currentTime) > 0.01 ||
        Math.abs(state.progress - progress) > 0.1
      ) {
        dispatch({ type: "setTime", payload: currentTime });
      }
    }, [state.duration, state.currentTime, state.progress]);

    // =============== FIXED: Keep getAngle function ===============
    const getAngle = useCallback((x: number, y: number) => {
      if (!diskRef.current) return 0;
      const rect = diskRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      return (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
    }, []);

    // =============== FIXED: Drag handlers that work ===============
    const handleDragStart = useCallback(
      (clientX: number, clientY: number) => {
        isDragging.current = true;
        setIsDraggingState(true);
        if (audioRef.current && state.isPlaying) {
          mediaManager.stop(audioRef.current);
        }
        lastAngle.current = getAngle(clientX, clientY);
      },
      [getAngle, state.isPlaying],
    );

    const lastDragUpdate = useRef(0);
    const handleDragMove = useCallback(
      (clientX: number, clientY: number) => {
        if (!isDragging.current || !audioRef.current || !diskRef.current)
          return;

        const now = Date.now();
        if (now - lastDragUpdate.current < 16) return;
        lastDragUpdate.current = now;

        const angle = getAngle(clientX, clientY);
        let delta = angle - lastAngle.current;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        lastAngle.current = angle;

        const PERCENTAGE_PER_DEGREE = 0.25;
        const newTime =
          audioRef.current.currentTime +
          ((delta * PERCENTAGE_PER_DEGREE) / 100) * state.duration;

        if (newTime >= state.duration) {
          audioRef.current.currentTime = state.duration;
          dispatch({ type: "setTime", payload: state.duration });
          return;
        }

        if (newTime <= 0) {
          audioRef.current.currentTime = 0;
          dispatch({ type: "setTime", payload: 0 });
          return;
        }

        audioRef.current.currentTime = newTime;
        dispatch({ type: "setTime", payload: newTime });
      },
      [getAngle, state.duration],
    );

    const handleDragEnd = useCallback(() => {
      isDragging.current = false;
      setIsDraggingState(false);
      if (audioRef.current && state.isPlaying) {
        mediaManager.play(audioRef.current);
      }
    }, [state.isPlaying]);

    const handleEnded = useCallback(() => {
      dispatch({ type: "reset" });
      if (audioRef.current) audioRef.current.currentTime = 0;
      if (goNext) goNext();
    }, [goNext]);

    // =============== FIXED: Proper drag hook usage ===============
    useAudioDiskDrag({
      isPlaying: state.isPlaying,
      duration: state.duration,
      handleDragMove,
      handleDragEnd,
    });

    // -------------------- Memoized values --------------------
    const diskSize = isMobile ? 300 : 400;
    const diskHoleSize = diskSize / 3;

    const processedFileName = useMemo(
      () =>
        fileName
          ?.replace(/\.[^/.]+$/, "")
          .split("")
          .join(" ") || "",
      [fileName],
    );

    // =============== FIXED: Pass diskRef to DiskVisual ===============
    useEffect(() => {
      return () => {
        if (logRef.current) clearTimeout(logRef.current);
      };
    }, []);

    // -------------------- JSX --------------------
    return (
      <div className="relative flex flex-col items-center gap-10 p-2 outline-none">
        <div className="relative">
          <DiskVisual
            diskRef={diskRef} // =============== PASS THE REF ===============
            diskSize={diskSize}
            progress={state.progress}
            isPlaying={state.isPlaying}
            isDraggingState={isDraggingState}
            diskHoleSize={diskHoleSize}
            cdImageUrl={cdImageUrl}
            fileName={fileName}
            processedFileName={processedFileName}
            onDragStart={handleDragStart}
          />

          <DiskControls
            diskHoleSize={diskHoleSize}
            isPlaying={state.isPlaying}
            togglePlayPause={togglePlayPause}
          />
        </div>

        <PlayTimeDisplay currentTime={state.currentTime} duration={state.duration} className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col gap-2 rounded px-2 py-1" />

        <audio
          ref={audioRef}
          src={mediaUrl || undefined}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        >
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  },
);

export default memo(CustomAudioDiskPlayer);
