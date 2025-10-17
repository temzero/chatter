import {
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useReducer,
  useMemo,
} from "react";
import { useDeviceStore } from "@/stores/deviceStore";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { formatDuration } from "@/common/utils/formatDuration";
import musicDiskCover from "@/assets/image/disk.png";

// Audio manager
let currentAudio: HTMLAudioElement | null = null;
const playAudio = (audio: HTMLAudioElement) => {
  if (currentAudio && currentAudio !== audio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio.dispatchEvent(new Event("pause"));
  }
  currentAudio = audio;
  audio.play();
};

const pauseAudio = (audio: HTMLAudioElement) => {
  if (currentAudio === audio) {
    audio.pause();
    currentAudio = null;
  }
};

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

// -------------------- Component --------------------
interface AudioDiskPlayerProps {
  mediaUrl: string;
  fileName?: string;
  attachmentType: AttachmentType.AUDIO | AttachmentType.VOICE;
  cdImageUrl?: string;
  goNext?: () => void;
}

export interface AudioPlayerRef {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
}

const CustomAudioDiskPlayer = forwardRef<AudioPlayerRef, AudioDiskPlayerProps>(
  ({ mediaUrl, fileName, cdImageUrl, goNext }, ref) => {
    const isMobile = useDeviceStore((state) => state.isMobile);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const diskRef = useRef<HTMLDivElement | null>(null);

    const [state, dispatch] = useReducer(audioReducer, initialState);

    // Dragging state
    const isDragging = useRef(false);
    const lastAngle = useRef(0);

    useImperativeHandle(ref, () => ({
      play: () => {
        if (audioRef.current) {
          playAudio(audioRef.current);
          dispatch({ type: "play" });
        }
      },
      pause: () => {
        if (audioRef.current) {
          pauseAudio(audioRef.current);
          dispatch({ type: "pause" });
        }
      },
      togglePlayPause: () => {
        togglePlayPause(); // just call the function above
      },
    }));

    // -------------------- Handlers --------------------
    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        dispatch({ type: "setDuration", payload: audioRef.current.duration });
      }
    };

    const handleTimeUpdate = () => {
      if (!audioRef.current) return;
      dispatch({ type: "setTime", payload: audioRef.current.currentTime });
    };

    const togglePlayPause = () => {
      if (!audioRef.current) return;

      if (state.isPlaying) {
        pauseAudio(audioRef.current);
        dispatch({ type: "pause" });
      } else {
        playAudio(audioRef.current);
        dispatch({ type: "play" });
      }
    };

    const getAngle = (x: number, y: number) => {
      if (!diskRef.current) return 0;
      const rect = diskRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      return (Math.atan2(y - cy, x - cx) * 180) / Math.PI;
    };

    const handleDragStart = (clientX: number, clientY: number) => {
      isDragging.current = true;
      lastAngle.current = getAngle(clientX, clientY);
    };

    const handleDragMove = (clientX: number, clientY: number) => {
      if (!isDragging.current || !audioRef.current) return;

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
        audioRef.current.currentTime = 0;
        dispatch({ type: "reset" });
        return;
      }

      audioRef.current.currentTime = Math.min(
        Math.max(newTime, 0),
        state.duration
      );
      dispatch({ type: "setTime", payload: audioRef.current.currentTime });
    };

    const handleDragEnd = () => {
      isDragging.current = false;
      if (audioRef.current && state.isPlaying) audioRef.current.play();
    };

    const handleEnded = () => {
      dispatch({ type: "reset" });
      if (audioRef.current) audioRef.current.currentTime = 0;
      if (goNext) {
        goNext();
      }
    };

    // -------------------- Event Listeners --------------------
    useEffect(() => {
      const onMouseMove = (e: MouseEvent) =>
        handleDragMove(e.clientX, e.clientY);
      const onMouseUp = () => handleDragEnd();
      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          const touch = e.touches[0];
          handleDragMove(touch.clientX, touch.clientY);
        }
      };
      const onTouchEnd = () => handleDragEnd();

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onTouchEnd);

      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onTouchEnd);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.isPlaying, state.duration]);

    // -------------------- Memoized values --------------------
    const diskSize = isMobile ? 300 : 400;
    const diskHoleSize = diskSize / 3;

    const processedFileName = useMemo(
      () =>
        fileName
          ?.replace(/\.[^/.]+$/, "")
          .split("")
          .join(" ") || "",
      [fileName]
    );

    // -------------------- JSX --------------------
    return (
      <div className="relative flex flex-col items-center gap-10 p-2">
        <div className="relative">
          <div
            id="disk"
            ref={diskRef}
            className="relative aspect-square rounded-full overflow-hidden border-4 border-[--border-color] flex items-center justify-center text-white cursor-grab"
            style={{
              width: diskSize,
              transform: `rotate(${(state.progress / 100) * 360}deg)`,
              transition:
                state.isPlaying && !isDragging.current
                  ? "transform 0.1s linear"
                  : "none",
              WebkitMaskImage: `radial-gradient(circle at center, transparent ${
                diskHoleSize / 2 - 1
              }px, black ${diskHoleSize / 2}px)`,
              maskImage: `radial-gradient(circle at center, transparent ${
                diskHoleSize / 2 - 1
              }px, black ${diskHoleSize / 2}px)`,
              WebkitMaskComposite: "source-in",
              maskComposite: "intersect",
            }}
            onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
            onTouchStart={(e) => {
              if (e.touches.length > 0) {
                const touch = e.touches[0];
                handleDragStart(touch.clientX, touch.clientY);
              }
            }}
          >
            <img
              src={cdImageUrl ?? musicDiskCover}
              alt="CD"
              className="w-full h-full object-cover rounded-full"
            />

            {fileName && (
              <svg className="absolute w-full h-full" viewBox="0 0 200 200">
                <defs>
                  <path
                    id="circlePath"
                    d="M100,100 m0,-85 a85,85 0 1,1 0,170 a85,85 0 1,1 0,-170"
                  />
                </defs>
                <text
                  fill="white"
                  fontSize="11"
                  opacity="0.8"
                  textAnchor="start"
                  transform="rotate(-90 100 100)"
                >
                  <textPath href="#circlePath">{processedFileName}</textPath>
                </text>
              </svg>
            )}

            <div
              id="duration-indicator"
              className="w-1 h-1 bg-red-500 absolute left-0 top-1/2 -translate-y-1/2"
            />
          </div>

          <button
            className="aspect-square absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full border-[16px] border-[--border-color]"
            style={{ width: diskHoleSize, zIndex: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
          >
            <i className="material-symbols-outlined filled text-6xl opacity-80">
              {state.isPlaying ? "pause" : "play_arrow"}
            </i>
          </button>

          <div
            id="start-indicator"
            className="w-1 h-1 bg-red-500 absolute left-0 top-1/2 -translate-y-1/2"
          />
        </div>

        <div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col gap-2 rounded px-2 py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center text-sm opacity-80">
            {state.currentTime !== 0 && (
              <>{formatDuration(state.currentTime)} / </>
            )}
            {formatDuration(state.duration)}
          </div>
        </div>

        <audio
          ref={audioRef}
          src={mediaUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        >
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }
);

export default CustomAudioDiskPlayer;
