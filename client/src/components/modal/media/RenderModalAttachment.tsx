import { useState, useEffect, useRef } from "react";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { formatFileSize } from "@/common/utils/format/formatFileSize";
import { handleDownload } from "@/common/utils/handleDownload";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { getFileIcon } from "@/common/utils/getFileIcon";
import CustomAudioDiskPlayer, {
  AudioPlayerRef,
} from "@/components/ui/media/CustomAudioDiskPlayer";
import { motion } from "framer-motion";
import { mediaViewerAnimations } from "@/common/animations/mediaViewerAnimations";
import { ModalImageViewer } from "./ModalImageViewer";
import { useMediaAttachmentKeys } from "@/common/hooks/keyEvent/useMediaAttachmentKeys";
import logger from "@/common/utils/logger";

export const RenderModalAttachment = ({
  attachment,
  rotation = 0,
  isCurrent = false,
  onMediaEnd,
}: {
  attachment: AttachmentResponse;
  rotation?: number;
  isCurrent?: boolean;
  onMediaEnd?: () => void;
}) => {
  const [isHorizontalAspectRatio, setIsHorizontalAspectRatio] = useState<
    boolean | null
  >(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioPlayerRef = useRef<AudioPlayerRef | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useMediaAttachmentKeys({
    isCurrent,
    attachmentType: attachment.type,
    videoRef,
    audioPlayerRef,
    scrollContainerRef,
  });

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
        logger.warn("Audio autoplay blocked:", err);
      }
    } else {
      audio.pause();
    }
  }, [isCurrent]);

  // Ensure video autoplay when visible
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isCurrent) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          logger.warn("Autoplay blocked:", error);
        });
      }
    } else {
      video.pause();
    }
  }, [isCurrent]);

  if (!attachment) return null;

  switch (attachment.type) {
    case AttachmentType.IMAGE:
      return (
        <ModalImageViewer
          attachment={attachment}
          rotation={rotation}
          ref={scrollContainerRef}
        />
      );

    case AttachmentType.VIDEO:
      return (
        <motion.video
          ref={videoRef}
          src={attachment.url}
          controls
          onEnded={() => {
            if (onMediaEnd) onMediaEnd();
          }}
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

    case AttachmentType.AUDIO:
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
          goNext={onMediaEnd}
        />
      );

    case AttachmentType.FILE:
      return (
        <motion.div
          className="mx-auto my-auto rounded-lg flex flex-col items-center border-4 border-[var(--border-color)]"
          animate={mediaViewerAnimations.rotation(rotation)}
        >
          <div className="flex flex-col justify-center items-center px-4">
            <i className="material-symbols-outlined text-8xl px-4">
              {getFileIcon(attachment.filename)}
            </i>
            <div className="text-lg font-medium text-center">
              {attachment.filename || "File"}
            </div>
            <div className="text-sm text-gray-400">
              {attachment.size
                ? formatFileSize(attachment.size)
                : "Unknown size"}
            </div>
          </div>
          <button
            onClick={() => handleDownload(attachment)}
            className="mt-4 w-full py-2 text-blue-500 hover:underline font-semibold rounded-none border-t-2 border-[var(--border-color)]"
          >
            Download
          </button>
        </motion.div>
      );

    default:
      return (
        <div className="flex items-center p-2 rounded text-6xl ">
          <span className="material-symbols-outlined">attach_file</span>
          <p className="text-lg">Type not supported</p>
        </div>
      );
  }
};
