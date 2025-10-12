import { useState, useEffect, useRef } from "react";
import type { AttachmentResponse } from "@/types/responses/message.response";
import { formatFileSize } from "@/utils/formatFileSize";
import { getFileIcon } from "@/utils/getFileIcon";
import { handleDownload } from "@/utils/handleDownload";
import { AttachmentType } from "@/types/enums/attachmentType";
// import CustomAudioPlayer, { AudioPlayerRef } from "../../ui/CustomAudioPlayer";
import CustomAudioDiskPlayer, {
  AudioPlayerRef,
} from "@/components/ui/CustomAudioDiskPlayer";
import { motion } from "framer-motion";
import { mediaViewerAnimations } from "@/animations/mediaViewerAnimations";
import { ModalImageViewer } from "./ModalImageViewer";

export const RenderModalAttachment = ({
  attachment,
  rotation = 0,
  isCurrent = false,
}: {
  attachment: AttachmentResponse;
  rotation?: number;
  isCurrent?: boolean;
}) => {
  const [isHorizontalAspectRatio, setIsHorizontalAspectRatio] = useState<
    boolean | null
  >(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioPlayerRef = useRef<AudioPlayerRef | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Pause media when it's not the current one
  useEffect(() => {
    if (!isCurrent) {
      if (attachment.type === "video" && videoRef.current) {
        videoRef.current.pause();
      }
      if (attachment.type === "audio" && audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    }
  }, [isCurrent, attachment.type]);

  // ✅ Ensure audio autoplay when visible
  useEffect(() => {
    const audio = audioPlayerRef.current;
    if (!audio) return;

    if (isCurrent) {
      try {
        audio.play();
      } catch (err) {
        console.warn("Audio autoplay blocked:", err);
      }
    } else {
      audio.pause();
    }
  }, [isCurrent]);

  // Handle spaceBar play/pause
  useEffect(() => {
    if (!isCurrent) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();

        if (attachment.type === "video" && videoRef.current) {
          if (videoRef.current.paused) {
            videoRef.current.play();
          } else {
            videoRef.current.pause();
          }
        }

        if (attachment.type === "audio" && audioPlayerRef.current) {
          audioPlayerRef.current.togglePlayPause();
        }
      }
      if (
        (e.key === "ArrowUp" || e.key === "ArrowDown") &&
        scrollContainerRef.current
      ) {
        e.preventDefault();
        const container = scrollContainerRef.current;
        const amount = container.clientHeight * 0.8;
        container.scrollBy({
          top: e.key === "ArrowDown" ? amount : -amount,
          behavior: "smooth",
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isCurrent, attachment.type]);

  // Ensure video autoplay when visible
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isCurrent) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Autoplay blocked:", error);
        });
      }
    } else {
      video.pause();
    }
  }, [isCurrent]);

  if (!attachment) return null;

  switch (attachment.type) {
    case "image":
      return (
        <ModalImageViewer
          attachment={attachment}
          rotation={rotation}
          ref={scrollContainerRef}
        />
      );

    case "video":
      return (
        <motion.video
          ref={videoRef}
          src={attachment.url}
          controls
          onLoadedMetadata={(e) => {
            const video = e.currentTarget;
            setIsHorizontalAspectRatio(video.videoWidth > video.videoHeight);
          }}
          className={`object-contain rounded ${
            isHorizontalAspectRatio === null
              ? ""
              : isHorizontalAspectRatio
              ? "w-[80vw] max-h-[80vh]"
              : "h-[93vh] max-w-[80vw]"
          }`}
          draggable="false"
          animate={mediaViewerAnimations.rotation(rotation)}
        />
      );

    case "audio":
      return (
        // <motion.div
        //   className="max-w-md rounded-lg border-4 border-[var(--border-color)]"
        //   animate={mediaViewerAnimations.rotation(rotation)}
        // >
        //   {/* <div className="p-4 custom-border-b flex items-center gap-1">
        //     <i className="material-symbols-outlined">music_note</i>
        //     {attachment.filename || "Audio file"}
        //   </div> */}
        // </motion.div>

        <CustomAudioDiskPlayer
          attachmentType={AttachmentType.AUDIO}
          mediaUrl={attachment.url}
          fileName={attachment.filename ?? ""}
          ref={audioPlayerRef}
        />
      );

    case "file":
      return (
        <motion.div
          className="mx-auto my-auto w-md pt-0 rounded-lg flex flex-col items-center border-4 border-[var(--border-color)]"
          animate={mediaViewerAnimations.rotation(rotation)}
        >
          <i className="material-symbols-outlined text-8xl px-4">
            {getFileIcon(attachment.filename, attachment.mimeType)}
          </i>
          <div className="text-lg font-medium text-center">
            {attachment.filename || "File"}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {attachment.size ? formatFileSize(attachment.size) : "Unknown size"}
          </div>
          <button
            onClick={() => handleDownload(attachment)}
            className="mt-4 w-full py-2 custom-border-t text-blue-500 hover:underline"
          >
            Download
          </button>
        </motion.div>
      );

    default:
      return null;
  }
};
