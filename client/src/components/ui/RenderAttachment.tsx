import React, { useState, useEffect } from "react";
import { formatFileSize } from "@/utils/formatFileSize";
import { useModalStore } from "@/stores/modalStore";
import { AttachmentResponse } from "@/shared/types/responses/message.response";
import { handleDownload } from "@/utils/handleDownload";
import { getFileIcon } from "@shared/utils/getFileIcon";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import CustomAudioPlayer from "./CustomAudioPlayer";
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
  console.log("attachment.type", attachment.type);

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
            <i className="material-symbols-outlined text-3xl transition-all group-hover:scale-110 group-hover:font-bold">
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

    default:
      return (
        <div className="flex items-center p-2 rounded text-6xl ">
          <span className="material-symbols-outlined">attach_file</span>
          <p className="text-lg">Type not supported</p>
        </div>
      );
  }
};

export default React.memo(RenderAttachment);
