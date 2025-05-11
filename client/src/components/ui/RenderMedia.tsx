import React, { useState, useEffect } from "react";
import { MediaProps } from "@/data/media";
import CustomAudioPlayer from "./CustomAudioPlayer";
import { formatFileSize } from "@/utils/formatFileSize";
import { getFileIcon } from "@/utils/getFileIcon";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import popupSound from "@/assets/sound/flip-switch.mp3";
import { useModalStore } from "@/stores/modalStore";

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

interface RenderMediaProps {
  media: MediaProps;
  className?: string;
  type?: string;
}

const RenderMedia: React.FC<RenderMediaProps> = ({
  media,
  className = "",
  type,
}) => {
  const { openModal } = useModalStore();
  const [hovered, setHovered] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (media.type === "image") {
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
        setAspectRatio(calculateAspectRatio(img.width, img.height));
      };
      img.src = media.url;
    }
    // For videos, we'll handle it differently since we can't preload like images
  }, [media.url, media.type]);

  // Determine if media is horizontal based on aspect ratio
  const isHorizontal = dimensions && dimensions.width > dimensions.height;

  const renderContainer = (content: React.ReactNode, extraClass = "") => (
    <div
      className={`relative cursor-pointer overflow-hidden ${className} ${extraClass}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {content}
    </div>
  );

  const handleDownloadClick = (url: string, fileName: string | undefined) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || true;
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
    openModal(media.id);
    playSound();
  };

  switch (media.type) {
    case "image":
      return renderContainer(
        <img
          src={media.url}
          alt="Media attachment"
          onClick={handleOpenModal}
          className="w-full h-full transition-all duration-300 hover:scale-125 object-cover"
        />
      );

    case "video":
      return renderContainer(
        <video
          className="w-full h-full transition-all duration-300 hover:scale-125 object-cover"
          controls
          onClick={handleOpenModal}
          onLoadedMetadata={handleVideoLoadedMetadata}
        >
          <source src={media.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );

    case "audio":
      return (
        <div
          className={`w-full flex items-center gap-2 custom-border-b overflow-hidden ${
            type === "info" ? "opacity-80" : "text-black bg-purple-400"
          }`}
        >
          <CustomAudioPlayer
            mediaUrl={media.url}
            fileName={media.fileName}
            type={type}
          />
        </div>
      );

    case "file":
      return renderContainer(
        <div
          className={`w-full p-2 flex items-center gap-2 custom-border-b overflow-hidden ${
            type === "info" ? "text-purple-400" : "text-black bg-purple-400"
          }`}
          onClick={() => handleDownloadClick(media.url, media.fileName)}
        >
          <i className="material-symbols-outlined text-3xl">
            {getFileIcon(media.fileName)}
          </i>
          <a
            href={media.url}
            download={media.fileName || true}
            className={`truncate`}
          >
            {media.fileName || "Download File"}
          </a>
          {hovered ? (
            <i className="material-symbols-outlined ml-auto">download</i>
          ) : (
            <p className="opacity-70 ml-auto">
              ({media.size ? formatFileSize(media.size) : "???"})
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
};

export default RenderMedia;
