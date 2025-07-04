import React from "react";
import { AttachmentResponse } from "@/types/responses/message.response";
import { AttachmentType } from "@/types/enums/attachmentType";
import { getFileIcon } from "@/utils/getFileIcon";
import { formatFileSize } from "@/utils/formatFileSize";
import { useModalStore } from "@/stores/modalStore";

interface RenderPinnedAttachmentProps {
  attachment: AttachmentResponse;
  className?: string;
}

const RenderPinnedAttachment: React.FC<RenderPinnedAttachmentProps> = ({
  attachment,
  className = "",
}) => {
  const baseStyle =
    "rounded flex items-center justify-center overflow-hidden border";

  const { openMediaModal } = useModalStore();
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openMediaModal(attachment.url)
    // window.open(attachment.url, "_blank");
  };

  switch (attachment.type) {
    case AttachmentType.IMAGE:
      return (
        <div
          className={`${baseStyle} ${className}`}
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        >
          <img
            src={attachment.thumbnailUrl || attachment.url}
            alt={attachment.filename || "Image"}
            className="object-cover w-full h-full"
          />
        </div>
      );

    case AttachmentType.VIDEO:
      return (
        <div
          className={`${baseStyle} ${className}`}
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        >
          <video
            src={attachment.url}
            className="object-cover w-full h-full"
            muted
            preload="metadata"
          />
        </div>
      );

    case AttachmentType.AUDIO:
      return (
        <div
          onClick={handleClick}
          className={`${baseStyle} ${className} bg-purple-100`}
        >
          🎵 Audio
        </div>
      );

    case AttachmentType.FILE:
      return (
        <div
          className={`${baseStyle} ${className} bg-purple-200 flex-col px-2 text-center`}
          onClick={() => window.open(attachment.url, "_blank")}
        >
          <i className="material-symbols-outlined text-2xl">
            {getFileIcon(attachment.filename || "", attachment.mimeType || "")}
          </i>
          <p className="text-xs truncate w-full">{attachment.filename}</p>
          <span className="text-xs opacity-60">
            {attachment.size ? formatFileSize(attachment.size) : "?"}
          </span>
        </div>
      );

    default:
      return null;
  }
};

export default RenderPinnedAttachment;
