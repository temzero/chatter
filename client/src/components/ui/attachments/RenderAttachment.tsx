import React, { useState, useEffect } from "react";
import { getCloseModal, setOpenMediaModal } from "@/stores/modalStore";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { formatFileSize } from "@/common/utils/format/formatFileSize";
import { handleDownload } from "@/common/utils/handleDownload";
import { getFileIcon } from "@/common/utils/getFileIcon";
import CustomAudioPlayer from "@/components/ui/media/CustomAudioPlayer";
import CustomVideoPlayer from "@/components/ui/media/CustomVideoPlayer";
import { LinkPreviewAttachment } from "./LinkPreviewAttachment";

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
  const closeModal = getCloseModal();

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

  const renderContainer = (content: React.ReactNode) => (
    <div
      className={`relative w-full h-full cursor-pointer overflow-hidden ${className}`}
    >
      {content}
    </div>
  );

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
    setOpenMediaModal(attachment.id);
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
        <CustomAudioPlayer
          type={type}
          mediaUrl={attachment.url}
          thumbnailUrl={attachment.thumbnailUrl ?? undefined}
          fileName={attachment.filename ?? undefined}
          attachmentType={AttachmentType.AUDIO}
          onOpenModal={handleOpenModal}
        />
      );

    case AttachmentType.FILE:
      return renderContainer(
        <div
          className={`w-full p-2 flex items-center gap-2 custom-border-b overflow-hidden ${
            type === "info" ? "text-purple-400" : "text-black bg-purple-400"
          }`}
          onClick={handleOpenModal}
        >
          <div
            className="flex items-center gap-2 group cursor-pointer transition-all pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(attachment);
            }}
          >
            <i className="material-symbols-outlined text-3xl! transition-all group-hover:scale-110 group-hover:font-bold">
              {getFileIcon(attachment.filename)}
            </i>
            <h1 className="truncate transition-all group-hover:font-bold">
              {attachment.filename || "Download File"}
            </h1>
          </div>
          <p className="opacity-70 ml-auto pointer-events-none">
            ({attachment.size ? formatFileSize(attachment.size) : "???"})
          </p>
        </div>
      );

    case AttachmentType.LINK:
      return (
          <LinkPreviewAttachment attachment={attachment} />
      );

    default:
      return renderContainer(
        <div className="flex items-center p-2 rounded text-6xl!">
          <span className="material-symbols-outlined">attach_file</span>
          <p className="text-lg">Type not supported</p>
        </div>
      );
  }
};

export default React.memo(RenderAttachment);
