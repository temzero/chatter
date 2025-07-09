import React, { useState, useEffect } from "react";
import CustomAudioPlayer from "./CustomAudioPlayer";
import { formatFileSize } from "@/utils/formatFileSize";
import { getFileIcon } from "@/utils/getFileIcon";
import { useModalStore } from "@/stores/modalStore";
import { AttachmentResponse } from "@/types/responses/message.response";
import { AttachmentType } from "@/types/enums/attachmentType";
import { playSound } from "@/utils/playSound";
import flipSwitchSound from "@/assets/sound/flip-switch.mp3";
import CustomVideoPlayer from "./CustomVideoPlayer";

// Helper function to calculate greatest common divisor (GCD)
const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

// Function to calculate aspect ratio
const calculateAspectRatio = (width: number, height: number): string => {
  const divisor = gcd(width, height);
  const ratioWidth = width / divisor;
  const ratioHeight = height / divisor;
  return `${ratioWidth}:${ratioHeight}`;
};

interface RenderAttachmentProps {
  attachment: AttachmentResponse;
  className?: string;
  type?: string;
  previewMode?: boolean;
}

const RenderAttachment: React.FC<RenderAttachmentProps> = ({
  attachment,
  className = "",
  type,
  previewMode = true,
}) => {
  const openMediaModal = useModalStore((state) => state.openMediaModal);
  const closeModal = useModalStore((state) => state.closeModal);

  const [aspectRatio, setAspectRatio] = useState<string | null>(null);

  useEffect(() => {
    if (attachment.type === AttachmentType.IMAGE) {
      // Use thumbnail if available in preview mode
      const src =
        previewMode && attachment.thumbnailUrl
          ? attachment.thumbnailUrl
          : attachment.url;

      const img = new Image();
      img.onload = () => {
        setAspectRatio(
          calculateAspectRatio(
            attachment.width || img.width,
            attachment.height || img.height
          )
        );
      };
      img.src = src;
    }
  }, [
    attachment.url,
    attachment.type,
    previewMode,
    attachment.thumbnailUrl,
    attachment.width,
    attachment.height,
  ]);

  if (!attachment) return null;

  const renderContainer = (content: React.ReactNode, extraClass = "") => (
    <div
      className={`relative w-full h-full cursor-pointer overflow-hidden ${className} ${extraClass}`}
    >
      {content}
    </div>
  );

  const handleDownloadClick = (url: string, fileName: string | null) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "file";
    link.click();
  };

  const handleVideoLoadedMetadata = (
    e: React.SyntheticEvent<HTMLVideoElement>
  ) => {
    const video = e.target as HTMLVideoElement;
    const width = video.videoWidth;
    const height = video.videoHeight;
    setAspectRatio(calculateAspectRatio(width, height));
  };

  const handleOpenModal = () => {
    closeModal();
    openMediaModal(attachment.id);
    playSound(flipSwitchSound);
  };

  // Get appropriate source URL based on preview mode
  const getMediaUrl = () => {
    if (previewMode && attachment.thumbnailUrl) {
      return attachment.thumbnailUrl;
    }
    return attachment.url;
  };

  switch (attachment.type) {
    case AttachmentType.IMAGE:
      return renderContainer(
        <img
          src={getMediaUrl()}
          alt={attachment.filename || "Image attachment"}
          onClick={handleOpenModal}
          className={`w-full h-full transition-all duration-300 object-cover`}
          style={{
            aspectRatio:
              aspectRatio ||
              (attachment.width && attachment.height
                ? `${attachment.width}/${attachment.height}`
                : undefined),
          }}
        />
      );

    case AttachmentType.VIDEO:
      return renderContainer(
        <CustomVideoPlayer
          videoAttachment={attachment}
          previewMode={previewMode}
          onOpenModal={handleOpenModal}
          onLoadedMetadata={handleVideoLoadedMetadata}
        />
      );

    case AttachmentType.AUDIO:
      return (
        <div
          className={`w-full flex items-center gap-2 custom-border-b overflow-hidden ${
            type === "info" ? "opacity-80" : "text-black bg-purple-400"
          }`}
        >
          <CustomAudioPlayer
            mediaUrl={attachment.url}
            fileName={attachment.filename ?? undefined}
            type={type}
            attachmentType={AttachmentType.AUDIO}
          />
        </div>
      );

    case AttachmentType.FILE:
      return renderContainer(
        <div
          className={`w-full p-2 flex items-center gap-2 custom-border-b overflow-hidden ${
            type === "info" ? "text-purple-400" : "text-black bg-purple-400"
          }`}
          onClick={() =>
            handleDownloadClick(attachment.url, attachment.filename ?? null)
          }
        >
          <i className="material-symbols-outlined text-3xl">
            {getFileIcon(attachment.filename ?? "", attachment.mimeType ?? "")}
          </i>
          <a
            href={attachment.url}
            download={attachment.filename || true}
            className="truncate"
          >
            {attachment.filename || "Download File"}
          </a>
          <p className="opacity-70 ml-auto">
            ({attachment.size ? formatFileSize(attachment.size) : "???"})
          </p>

          {/* <div className="fixed inset-0 flex bg-black/30 backdrop-blur-sm">
            <i className="material-symbols-outlined ml-auto">download</i>
          </div> */}
        </div>
      );

    default:
      return null;
  }
};

export default React.memo(RenderAttachment);
