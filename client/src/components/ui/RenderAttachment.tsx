import React, { useState, useEffect } from "react";
import CustomAudioPlayer from "./CustomAudioPlayer";
import { formatFileSize } from "@/utils/formatFileSize";
import { getFileIcon } from "@/utils/getFileIcon";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import popupSound from "@/assets/sound/flip-switch.mp3";
import { useModalStore } from "@/stores/modalStore";
import { AttachmentResponse } from "@/types/responses/message.response";
import { AttachmentType } from "@/types/enums/attachmentType";

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
  previewMode = false,
}) => {
  const { openMediaModal } = useModalStore();
  const [hovered, setHovered] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (attachment.type === AttachmentType.IMAGE) {
      // Use thumbnail if available in preview mode
      const src =
        previewMode && attachment.thumbnailUrl
          ? attachment.thumbnailUrl
          : attachment.url;

      const img = new Image();
      img.onload = () => {
        setDimensions({
          width: attachment.width || img.width,
          height: attachment.height || img.height,
        });
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

  // Determine if media is horizontal based on aspect ratio or provided dimensions
  const isHorizontal =
    (dimensions?.width || attachment.width || 0) >
    (dimensions?.height || attachment.height || 0);

  console.log('isHorizontal', isHorizontal)

  const renderContainer = (content: React.ReactNode, extraClass = "") => (
    <div
      className={`relative cursor-pointer overflow-hidden ${className} ${extraClass}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
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
    setDimensions({ width, height });
    setAspectRatio(calculateAspectRatio(width, height));
  };

  const playSound = useSoundEffect(popupSound);
  const handleOpenModal = () => {
    openMediaModal(attachment.id);
    playSound[0]();
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
        <video
          className={`w-full h-full transition-all duration-300 object-cover`}
          controls={!previewMode}
          onClick={previewMode ? handleOpenModal : undefined}
          onLoadedMetadata={handleVideoLoadedMetadata}
          style={{
            aspectRatio:
              aspectRatio ||
              (attachment.width && attachment.height
                ? `${attachment.width}/${attachment.height}`
                : undefined),
          }}
        >
          <source
            src={attachment.url}
            type={attachment.mimeType || "video/mp4"}
          />
          Your browser does not support the video tag.
          {previewMode && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <span className="text-white text-lg">▶</span>
            </div>
          )}
        </video>
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
          {hovered ? (
            <i className="material-symbols-outlined ml-auto">download</i>
          ) : (
            <p className="opacity-70 ml-auto">
              ({attachment.size ? formatFileSize(attachment.size) : "???"})
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
};

export default RenderAttachment;
