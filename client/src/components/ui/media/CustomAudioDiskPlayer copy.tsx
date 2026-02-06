import {
  useRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  useCallback,
  memo,
  useEffect,
} from "react";
import { useIsMobile } from "@/stores/deviceStore";
import { useAudioDiskDrag } from "@/common/hooks/keyEvent/useAudioDiskDrag";
import { useAudioPlayer } from "@/common/hooks/useAudioPlayer";
import musicDiskCover from "@/assets/image/disk.png";
import PlayTimeDisplay from "../PlayTimeDisplay";

const DRAG_SENSITIVITY = 0.25;

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
    
    // Track time during drag (DOM-only updates)
    const dragCurrentTime = useRef(0);
    
    // Track playback state
    const wasPlayingBeforeDrag = useRef(false);

    // Use the hook for audio logic
    const {
      audioRef,
      isPlaying,
      currentTime,
      duration,
      play,
      pause,
      togglePlayPause,
      seekTo,
    } = useAudioPlayer({
      onEnded: () => {
        if (goNext) goNext();
      },
      initialCurrentTime: initCurrentTime,
    });

    // Calculate progress for normal playback (when NOT dragging)
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Expose methods to parent
    useImperativeHandle(
      ref,
      () => ({
        play,
        pause,
        togglePlayPause,
        seekTo,
      }),
      [play, pause, togglePlayPause, seekTo],
    );

    // =============== DOM-ONLY DRAG LOGIC ===============
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
        wasPlayingBeforeDrag.current = isPlaying;

        // Store current time at drag start
        dragCurrentTime.current = audioRef.current?.currentTime || 0;

        if (isPlaying) {
          pause();
        }

        lastAngle.current = getAngle(clientX, clientY);
        
        // Disable transitions on disk immediately for smooth dragging
        const diskElement = diskRef.current;
        if (diskElement) {
          diskElement.style.transition = 'none';
        }
      },
      [getAngle, isPlaying, pause, audioRef],
    );

    const handleDragMove = useCallback(
      (clientX: number, clientY: number) => {
        if (!isDragging.current || !diskRef.current || !audioRef.current)
          return;

        const now = Date.now();
        if (now - lastDragUpdate.current < 16) return; // ~60fps throttle
        lastDragUpdate.current = now;

        const angle = getAngle(clientX, clientY);
        let delta = angle - lastAngle.current;
        if (delta > 180) delta -= 360;
        if (delta < -180) delta += 360;
        lastAngle.current = angle;

        // Calculate new time
        const timeDelta = ((delta * DRAG_SENSITIVITY) / 100) * duration;
        const newTime = dragCurrentTime.current + timeDelta;

        // Clamp to valid range
        const clampedTime = Math.max(
          0,
          Math.min(newTime, duration || Infinity),
        );

        // ---------- PURE DOM OPERATIONS (NO REACT STATE) ----------
        // 1. Update audio element directly (silent playback)
        audioRef.current.currentTime = clampedTime;
        
        // 2. Update disk rotation DIRECTLY via DOM (no React re-render)
        const diskElement = diskRef.current;
        if (diskElement) {
          const rotationDeg = duration > 0 ? (clampedTime / duration) * 360 : 0;
          diskElement.style.transform = `rotate(${rotationDeg}deg)`;
        }
        
        // 3. Update ref for next calculation
        dragCurrentTime.current = clampedTime;
      },
      [getAngle, duration, audioRef],
    );

    const handleDragEnd = useCallback(() => {
      if (!audioRef.current || !diskRef.current) return;

      // Re-enable transition on disk for smooth playback
      const diskElement = diskRef.current;
      if (diskElement) {
        diskElement.style.transition = 
          isPlaying ? 'transform 0.1s linear' : 'none';
      }

      // Now sync with React state ONLY ONCE at the end
      seekTo(dragCurrentTime.current);

      isDragging.current = false;
      setIsDraggingState(false);

      // Resume playback if it WAS playing before drag
      if (wasPlayingBeforeDrag.current) {
        play();
      }
    }, [play, seekTo, audioRef, isPlaying]);

    // Use drag hook
    useAudioDiskDrag({
      isPlaying,
      duration,
      handleDragMove,
      handleDragEnd,
    });

    // Update disk rotation for normal playback (when NOT dragging)
    useEffect(() => {
      if (!isDraggingState && diskRef.current) {
        const diskElement = diskRef.current;
        const rotationDeg = duration > 0 ? (currentTime / duration) * 360 : 0;
        diskElement.style.transform = `rotate(${rotationDeg}deg)`;
        diskElement.style.transition = 
          isPlaying ? 'transform 0.1s linear' : 'none';
      }
    }, [currentTime, duration, isPlaying, isDraggingState]);

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
          {/* DiskVisual now just renders static disk, rotation is DOM-controlled */}
          <DiskVisual
            diskRef={diskRef}
            diskSize={diskSize}
            progress={0} // Not used when DOM-controlled
            isPlaying={isPlaying}
            isDraggingState={isDraggingState}
            diskHoleSize={diskHoleSize}
            cdImageUrl={cdImageUrl}
            fileName={fileName}
            processedFileName={processedFileName}
            onDragStart={handleDragStart}
            isDragControlled={true} // Indicate DOM control
          />

          <DiskControls
            diskHoleSize={diskHoleSize}
            isPlaying={isPlaying}
            togglePlayPause={togglePlayPause}
          />
        </div>

        {/* Show drag time when dragging, normal time otherwise */}
        <PlayTimeDisplay
          currentTime={isDraggingState ? dragCurrentTime.current : currentTime}
          duration={duration}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col gap-2 rounded px-2 py-1"
        />

        {mediaUrl && (
          <audio
            ref={audioRef}
            src={mediaUrl}
            preload="metadata"
            style={{ display: "none" }}
          />
        )}
      </div>
    );
  },
);

export default memo(CustomAudioDiskPlayer);

// =============== UPDATED SUB-COMPONENTS ===============
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
  isDragControlled?: boolean; // New prop to indicate DOM control
}

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
    isDragControlled = false,
  }: DiskVisualProps) => {
    // Only set initial style when NOT drag-controlled
    const diskStyle = useMemo(() => {
      if (isDragControlled) {
        return {
          width: diskSize,
          // Transform will be set via DOM in parent component
          WebkitMaskImage: `radial-gradient(circle at center, transparent ${
            diskHoleSize / 2 - 1
          }px, black ${diskHoleSize / 2}px)`,
          maskImage: `radial-gradient(circle at center, transparent ${
            diskHoleSize / 2 - 1
          }px, black ${diskHoleSize / 2}px)`,
          WebkitMaskComposite: "source-in" as const,
          maskComposite: "intersect" as const,
        };
      }
      
      return {
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
      };
    }, [diskSize, diskHoleSize, progress, isPlaying, isDraggingState, isDragControlled]);

    return (
      <div
        id="disk"
        ref={diskRef}
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
          src={cdImageUrl ? cdImageUrl : musicDiskCover}
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