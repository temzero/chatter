import { AttachmentResponse } from "@/types/responses/message.response";
import { useRef, useState, MouseEvent, useEffect } from "react";
import { formatDuration } from "@/utils/formatDuration";
import { ModalType, useModalContent } from "@/stores/modalStore";

// Video manager implementation
let currentVideo: HTMLVideoElement | null = null;

const playVideo = (videoElement: HTMLVideoElement) => {
  // Pause the currently playing video if it exists
  if (currentVideo && currentVideo !== videoElement) {
    currentVideo.pause();
    // Dispatch pause event to sync other players
    const event = new Event("pause");
    currentVideo.dispatchEvent(event);
  }

  // Set the new video as current and play it
  currentVideo = videoElement;
  videoElement.play().catch(console.error);
};

const stopCurrentVideo = () => {
  if (currentVideo) {
    currentVideo.pause();
    currentVideo = null;
  }
};

interface CustomVideoPlayerProps {
  videoAttachment: AttachmentResponse;
  previewMode?: boolean;
  onOpenModal?: () => void;
  onLoadedMetadata?: (event: React.SyntheticEvent<HTMLVideoElement>) => void;
}

const CustomVideoPlayer = ({
  videoAttachment,
  previewMode = false,
  onOpenModal,
  onLoadedMetadata,
}: CustomVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafId = useRef<number>(0);
  const displayRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [totalDuration, setTotalDuration] = useState(
    videoAttachment.duration || 0
  );

  const modalContent = useModalContent();

  const url = videoAttachment.url;
  const mimeType = videoAttachment.mimeType || "video/mp4";

  const updateTimeDisplay = () => {
    if (videoRef.current && displayRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || totalDuration;
      displayRef.current.textContent = `${formatDuration(
        current
      )} / ${formatDuration(total)}`;
      rafId.current = requestAnimationFrame(updateTimeDisplay);
    }
  };

  // Handle play/pause events from other video players
  useEffect(() => {
    const handleExternalPause = () => {
      setIsPlaying(false);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener("pause", handleExternalPause);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("pause", handleExternalPause);
        if (currentVideo === videoElement) {
          stopCurrentVideo();
        }
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
        }
      }
    };
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        playVideo(videoRef.current);
        setIsPlaying(true);
        rafId.current = requestAnimationFrame(updateTimeDisplay);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
        }
        if (displayRef.current) {
          const total = videoRef.current.duration || totalDuration;
          displayRef.current.textContent = formatDuration(total);
        }
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    if (previewMode) {
      togglePlayPause();
    } else if (onOpenModal) {
      onOpenModal();
    }
  };

  const handleRightClick = (e: MouseEvent) => {
    if (modalContent?.type !== ModalType.MESSAGE) return;
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current?.play) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    if (onOpenModal) {
      // togglePlayPause();
      onOpenModal();
    }
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.target as HTMLVideoElement;
    setTotalDuration(video.duration || videoAttachment.duration || 0);
    if (onLoadedMetadata) {
      onLoadedMetadata(e);
    }
    if (displayRef.current) {
      displayRef.current.textContent = formatDuration(video.duration);
    }
  };

  return (
    <div
      onContextMenu={handleRightClick}
      className="relative w-full h-full group"
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        controls={false}
        onClick={handleClick}
        muted={isMuted}
        onPlay={() => {
          setIsPlaying(true);
          rafId.current = requestAnimationFrame(updateTimeDisplay);
        }}
        onPause={() => {
          if (videoRef.current !== currentVideo) {
            setIsPlaying(false);
          }
          if (rafId.current) {
            cancelAnimationFrame(rafId.current);
          }
          if (videoRef.current && displayRef.current) {
            const total = videoRef.current.duration || totalDuration;
            displayRef.current.textContent = formatDuration(total);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          if (videoRef.current === currentVideo) {
            currentVideo = null;
          }
          if (rafId.current) {
            cancelAnimationFrame(rafId.current);
          }
        }}
        onLoadedMetadata={handleLoadedMetadata}
      >
        <source src={url} type={mimeType} />
        Your browser does not support the video tag.
      </video>

      {previewMode && !isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={handleClick}
        >
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-black/50 select-none">
            <span className="text-white text-3xl">▶</span>
          </div>
        </div>
      )}

      <div
        ref={displayRef}
        className="absolute bottom-1 right-1 bg-black/50 text-white text-xs p-0.5 rounded"
      >
        {formatDuration(totalDuration)}
      </div>

      {/* Mute button */}
      {previewMode && isPlaying && (
        <button
          className="absolute bottom-1 left-1 bg-black/50 text-white px-1 rounded hover:bg-black/70 transition"
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          aria-label={isMuted ? "Mute" : "Unmute"}
        >
          {isMuted ? (
            <span className="material-symbols-outlined text-lg">
              volume_off
            </span>
          ) : (
            <span className="material-symbols-outlined text-lg">volume_up</span>
          )}
        </button>
      )}
    </div>
  );
};

export default CustomVideoPlayer;
