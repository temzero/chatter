import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { AttachmentType } from "@/types/enums/attachmentType";
import { formatDuration } from "@/utils/formatDuration";
import musicDiskCover from "@/assets/image/disk-cover2.jpg";

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
    currentAudio = null; // ✅ clear currentAudio when paused
  }
};

interface AudioDiskPlayerProps {
  mediaUrl: string;
  fileName?: string;
  attachmentType: AttachmentType.AUDIO | AttachmentType.VOICE;
  cdImageUrl?: string;
}

export interface AudioPlayerRef {
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
}

const AudioDiskPlayer = forwardRef<AudioPlayerRef, AudioDiskPlayerProps>(
  ({ mediaUrl, fileName, cdImageUrl }, ref) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const diskRef = useRef<HTMLDivElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [progress, setProgress] = useState(0);
    const durationRef = useRef(0);

    // Dragging state
    const isDragging = useRef(false);
    const lastAngle = useRef(0);

    useImperativeHandle(ref, () => ({
      play: () => {
        if (audioRef.current) {
          playAudio(audioRef.current);
          setIsPlaying(true);
        }
      },
      pause: () => {
        if (audioRef.current) {
          pauseAudio(audioRef.current);
          setIsPlaying(false);
        }
      },
      togglePlayPause: () => {
        if (!audioRef.current) return;
        if (isPlaying) {
          pauseAudio(audioRef.current);
          setIsPlaying(false);
        } else {
          playAudio(audioRef.current);
          setIsPlaying(true);
        }
      },
    }));

    const handleLoadedMetadata = () => {
      if (audioRef.current) durationRef.current = audioRef.current.duration;
    };

    const handleTimeUpdate = () => {
      if (!audioRef.current) return;
      setCurrentTime(audioRef.current.currentTime);
      const dur = audioRef.current.duration || durationRef.current;
      setProgress((audioRef.current.currentTime / dur) * 100);
    };

    const togglePlayPause = () => {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        playAudio(audioRef.current);
        setIsPlaying(true);
      }
    };

    // ---- DJ-style rotation ----
    const getAngle = (x: number, y: number) => {
      if (!diskRef.current) return 0;
      const rect = diskRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      return Math.atan2(y - cy, x - cx) * (180 / Math.PI);
    };

    const handleDragStart = (clientX: number, clientY: number) => {
      isDragging.current = true;
      lastAngle.current = getAngle(clientX, clientY);
      // if (audioRef.current) audioRef.current.pause();
    };

    const handleDragMove = (clientX: number, clientY: number) => {
      if (!isDragging.current) return;
      const angle = getAngle(clientX, clientY);
      let delta = angle - lastAngle.current;

      // Handle angle wrapping
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;

      lastAngle.current = angle;

      if (audioRef.current && durationRef.current) {
        const timeDelta = (delta / 360) * 200; // dragging speed
        audioRef.current.currentTime = Math.min(
          Math.max(audioRef.current.currentTime + timeDelta, 0),
          durationRef.current
        );
        setCurrentTime(audioRef.current.currentTime);
        setProgress((audioRef.current.currentTime / durationRef.current) * 100);
      }
    };

    const handleDragEnd = () => {
      isDragging.current = false;
      if (audioRef.current && isPlaying) audioRef.current.play();
    };

    // const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    //   if (audioRef.current && durationRef.current) {
    //     const newTime = (Number(e.target.value) / 100) * durationRef.current;
    //     audioRef.current.currentTime = newTime;
    //     setCurrentTime(newTime);
    //     setProgress(Number(e.target.value));
    //   }
    // };
    // Mouse events
    useEffect(() => {
      const handleMouseMoveWindow = (e: MouseEvent) =>
        handleDragMove(e.clientX, e.clientY);
      const handleMouseUpWindow = () => handleDragEnd();

      window.addEventListener("mousemove", handleMouseMoveWindow);
      window.addEventListener("mouseup", handleMouseUpWindow);
      return () => {
        window.removeEventListener("mousemove", handleMouseMoveWindow);
        window.removeEventListener("mouseup", handleMouseUpWindow);
      };
    }, []);

    // Touch events
    useEffect(() => {
      const handleTouchMoveWindow = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          const touch = e.touches[0];
          handleDragMove(touch.clientX, touch.clientY);
        }
      };
      const handleTouchEndWindow = () => handleDragEnd();

      window.addEventListener("touchmove", handleTouchMoveWindow);
      window.addEventListener("touchend", handleTouchEndWindow);
      return () => {
        window.removeEventListener("touchmove", handleTouchMoveWindow);
        window.removeEventListener("touchend", handleTouchEndWindow);
      };
    }, []);

    return (
      <div className="relative flex flex-col items-center gap-10 p-2">
        {/* Large rotating CD */}
        <div className="relative">
          <div
            id="disk"
            ref={diskRef}
            className="relative w-80 h-80 rounded-full overflow-hidden border-2 border-[--border-color] bg-[--border-color] flex items-center justify-center text-white cursor-grab"
            style={{
              transform: `rotate(${(progress / 100) * 360}deg)`,
              transition:
                isPlaying && !isDragging.current
                  ? "transform 0.1s linear"
                  : "none",
            }}
            onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
            onTouchStart={(e) => {
              if (e.touches.length > 0) {
                const touch = e.touches[0];
                handleDragStart(touch.clientX, touch.clientY);
              }
            }}
          >
            {/* CD image */}
            {cdImageUrl ||
              (musicDiskCover && (
                <img
                  src={cdImageUrl ?? musicDiskCover}
                  alt="CD"
                  className="w-full h-full object-cover rounded-full"
                />
              ))}

            {fileName && (
              <svg
                className="absolute w-full h-full"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <path
                    id="circlePath"
                    d="M100,100 m0,-80 a80,80 0 1,1 0,160 a80,80 0 1,1 0,-160"
                  />
                </defs>
                <text
                  fill="white"
                  fontSize="12"
                  textAnchor="start"
                  transform="rotate(-90 100 100)"
                >
                  <textPath href="#circlePath">
                    {fileName.split("").join(" ")}
                  </textPath>
                </text>
              </svg>
            )}

            {/* <div
              id="duration-indicator"
              className="w-1.5 h-1.5 bg-red-500/80 absolute top-1/2 left-0 -translate-y-1/2"
            /> */}
            <div
              id="duration-indicator"
              className="w-1 h-1 bg-red-500 absolute left-0 top-1/2 -translate-y-1/2"
            />
            {/* <div
              id="duration-indicator"
              className="absolute top-1/2 left-0 -translate-y-1/2 w-0 h-0 
             border-t-[4px] border-b-[4px] border-r-[6px] 
             border-t-transparent border-b-transparent border-r-red-500"
            /> */}
          </div>
          {/* Play/Pause button in center */}
          <button
            className="w-20 h-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full custom-border bg-black/60"
            style={{ zIndex: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
          >
            <i className="material-symbols-outlined filled text-4xl opacity-80">
              {isPlaying ? "pause" : "play_arrow"}
            </i>
          </button>
          {/* <div
            id="play-stick"
            className="absolute top-1/2 -left-5 -translate-y-1/2 opacity-50 flex items-center"
          >
            <span className="material-symbols-outlined text-4xl">sliders</span>
          </div> */}
          <div
            id="start-indicator"
            className="w-1 h-1 bg-red-500/50 absolute left-0 top-1/2 -translate-y-1/2"
          />
        </div>

        <div
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-col gap-2 rounded  px-2 py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center text-sm opacity-80">
            {currentTime !== 0 && <>{formatDuration(currentTime)} / </>}
            {formatDuration(durationRef.current)}
          </div>
          {/* <input
            id="progress-bar"
            type="range"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1 rounded-full cursor-pointer appearance-none custom-slider"
            style={{
              background: `linear-gradient(to right, var(--primary-green) ${progress}%, gray ${progress}%)`,
            }}
          /> */}
          {/* <h2 className="text-lg truncate">{fileName || "Audio Track"}</h2> */}
        </div>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={mediaUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        >
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }
);

export default AudioDiskPlayer;
