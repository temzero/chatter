import {
  useRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  useCallback,
  memo,
} from "react";
import { useIsMobile } from "@/stores/deviceStore";
import { useAudioDiskDrag } from "@/common/hooks/keyEvent/useAudioDiskDrag";
import { useAudioPlayer } from "@/common/hooks/useAudioPlayer";
import musicDiskCover from "@/assets/image/disk.png";
import PlayTimeDisplay from "../PlayTimeDisplay";

const DRAG_SENSITIVITY = 0.4;

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
    const diskRef = useRef<HTMLDivElement | null>(null);
    const isDragging = useRef(false);
    const lastAngle = useRef(0);
    const [isDraggingState, setIsDraggingState] = useState(false);
    const lastDragUpdate = useRef(0);

    // SIMPLIFIED: Use the hook for ALL audio logic
    const {
      audioRef,
      isPlaying,
      currentTime,
      duration,
      play,
      pause,
      togglePlayPause,
      seekTo: hookSeekTo,
    } = useAudioPlayer({
      onEnded: () => {
        if (goNext) goNext();
      },
      initialCurrentTime: initCurrentTime,
    });

    // Calculate progress for the disk rotation
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Expose methods to parent
    useImperativeHandle(
      ref,
      () => ({
        play,
        pause,
        togglePlayPause,
        seekTo: hookSeekTo,
      }),
      [play, pause, togglePlayPause, hookSeekTo],
    );

    // =============== DRAG LOGIC (SIMPLIFIED) ===============
    const getAngle = useCallback((x: number, y: number) => {
      if (!diskRef.current) return 0;
      const rect = diskRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      return (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
    }, []);

    const handleDragStart = useCallback(
      (clientX: number, clientY: number) => {
        isDragging.current = true;
        setIsDraggingState(true);
        if (isPlaying) {
          pause(); // Use hook's pause
        }
        lastAngle.current = getAngle(clientX, clientY);
      },
      [getAngle, isPlaying, pause],
    );

    const handleDragMove = useCallback(
      (clientX: number, clientY: number) => {
        if (!isDragging.current || !diskRef.current) return;

        const now = Date.now();
        if (now - lastDragUpdate.current < 16) return; // ~60fps
        lastDragUpdate.current = now;

        const angle = getAngle(clientX, clientY);
        let delta = angle - lastAngle.current;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        lastAngle.current = angle;

        const timeDelta = ((delta * DRAG_SENSITIVITY) / 100) * duration;
        const newTime = currentTime + timeDelta;

        // Use hook's seekTo which handles edge cases
        hookSeekTo(Math.max(0, Math.min(newTime, duration)));
      },
      [getAngle, currentTime, duration, hookSeekTo],
    );

    const handleDragEnd = useCallback(() => {
      isDragging.current = false;
      setIsDraggingState(false);
      if (isPlaying) {
        play(); // Use hook's play
      }
    }, [isPlaying, play]);

    // Use drag hook
    useAudioDiskDrag({
      isPlaying,
      duration,
      handleDragMove,
      handleDragEnd,
    });

    // =============== REST OF YOUR COMPONENT STAYS THE SAME ===============
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

    return (
      <div className="relative flex flex-col items-center gap-10 p-2 outline-none">
        <div className="relative">
          <DiskVisual
            diskRef={diskRef}
            diskSize={diskSize}
            progress={progress} // Now calculated from hook state
            isPlaying={isPlaying}
            isDraggingState={isDraggingState}
            diskHoleSize={diskHoleSize}
            cdImageUrl={cdImageUrl}
            fileName={fileName}
            processedFileName={processedFileName}
            onDragStart={handleDragStart}
          />

          <DiskControls
            diskHoleSize={diskHoleSize}
            isPlaying={isPlaying}
            togglePlayPause={togglePlayPause} // Use hook's toggle
          />
        </div>

        <PlayTimeDisplay currentTime={currentTime} duration={duration} className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col gap-2 rounded px-2 py-1" />

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

export default memo(CustomAudioDiskPlayer);

// =============== SUB-COMPONENTS ===============
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
