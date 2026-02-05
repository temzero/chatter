import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { useRef, useState, MouseEvent, useEffect } from "react";
import { formatDuration } from "@/common/utils/format/formatDuration";
import { ModalType } from "@/common/enums/modalType";
import { setOpenMediaModal, useModalStore } from "@/stores/modalStore";
import mediaManager from "@/services/media/mediaManager";

interface CustomVideoPlayerProps {
  videoAttachment: AttachmentResponse;
  previewMode?: boolean;
  onLoadedMetadata?: (event: React.SyntheticEvent<HTMLVideoElement>) => void;
}

const CustomVideoPlayer = ({
  videoAttachment,
  previewMode = false,
  onLoadedMetadata,
}: CustomVideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafId = useRef<number>(0);
  const displayRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [totalDuration, setTotalDuration] = useState(
    videoAttachment.duration || 0,
  );

  const url = videoAttachment.url;
  const mimeType = videoAttachment.mimeType || "video/mp4";

  const updateTimeDisplay = () => {
    if (videoRef.current && displayRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || totalDuration;
      displayRef.current.textContent = `${formatDuration(
        current,
      )} / ${formatDuration(total)}`;
      rafId.current = requestAnimationFrame(updateTimeDisplay);
    }
  };

  // Pause video if another video plays (mediaManager handles this)
  useEffect(() => {
    const handleExternalPause = () => {
      setIsPlaying(false);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener("pause", handleExternalPause);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("pause", handleExternalPause);
        if (rafId.current) cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  const togglePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      mediaManager.stop(videoRef.current);
      setIsPlaying(false);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    } else {
      mediaManager.play(videoRef.current);
      setIsPlaying(true);
      rafId.current = requestAnimationFrame(updateTimeDisplay);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleOpenModal = () => {
    // Store current time for modal
    const currentTime = videoRef.current?.currentTime || 0;
    // Open modal with current time
    setOpenMediaModal(videoAttachment.id, currentTime);
    // Stop and reset this player
    if (isPlaying) {
      togglePlayPause(); // This handles stop + state updates
    }
    // Reset to beginning
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    if (previewMode) togglePlayPause();
    else handleOpenModal();
  };

  const handleRightClick = (e: MouseEvent) => {
    if (useModalStore.getState().type !== ModalType.OVERLAY) return;
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current?.play) {
      mediaManager.stop(videoRef.current);
      setIsPlaying(false);
    }
    handleOpenModal();
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    setTotalDuration(video.duration || videoAttachment.duration || 0);
    if (onLoadedMetadata) onLoadedMetadata(e);
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
        poster={videoAttachment.thumbnailUrl || undefined}
        className="w-full h-full object-cover"
        controls={false}
        onClick={handleClick}
        muted={isMuted}
        onPlay={() => {
          setIsPlaying(true);
          rafId.current = requestAnimationFrame(updateTimeDisplay);
        }}
        onPause={() => {
          setIsPlaying(false);
          if (rafId.current) cancelAnimationFrame(rafId.current);
          if (videoRef.current && displayRef.current) {
            const total = videoRef.current.duration || totalDuration;
            displayRef.current.textContent = formatDuration(total);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          if (rafId.current) cancelAnimationFrame(rafId.current);
        }}
        onLoadedMetadata={handleLoadedMetadata}
      >
        <source src={url} type={mimeType} />
        Your browser does not support the video tag.
      </video>

      {previewMode && !isPlaying && (
        <div
          className="w-full h-full absolute inset-0 flex items-center justify-center cursor-pointer select-none"
          onClick={handleOpenModal}
        >
          <button
            className="bg-black/70 rounded-full! opacity-70 hover:opacity-100 hover:scale-125 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              handleClick(e);
            }}
          >
            <span className="material-symbols-outlined filled text-6xl!">
              play_arrow
            </span>
          </button>
        </div>
      )}

      <div
        ref={displayRef}
        className="absolute bottom-1 right-1 bg-black/50 text-white text-xs p-1 rounded"
      >
        {formatDuration(totalDuration)}
      </div>

      {previewMode && isPlaying && (
        <button
          className="absolute bottom-1 left-1 bg-black/50 text-white px-1 rounded-full! hover:bg-black/70 transition"
          onClick={(e) => {
            e.stopPropagation();
            toggleMute();
          }}
          aria-label={isMuted ? "Mute" : "Unmute"}
        >
          {isMuted ? (
            <span className="material-symbols-outlined text-lg!">
              volume_off
            </span>
          ) : (
            <span className="material-symbols-outlined text-lg!">
              volume_up
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default CustomVideoPlayer;
