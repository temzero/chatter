import * as React from "react";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { getFileIcon } from "@/common/utils/getFileIcon";
import { setOpenMediaModal } from "@/stores/modalStore";
import CustomAudioPlayer from "@/components/ui/media/CustomAudioPlayer";
import { PinnedLinkPreview } from "@/components/chat/components/message/preview/PinnedLinkPreview";

interface RenderPinnedAttachmentProps {
  attachment: AttachmentResponse;
  isCrop?: boolean;
  className?: string;
  index?: number;
}

const sizeClass = "w-8 h-8";

const RenderPinnedAttachment: React.FC<RenderPinnedAttachmentProps> = ({
  attachment,
  isCrop,
  className = "",
  index,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMediaModal(attachment.id);
  };

  const handleFileClick = () => {
    window.open(attachment.url, "_blank");
  };

  const icon =
    attachment.type === AttachmentType.AUDIO
      ? "music_note"
      : getFileIcon(attachment.filename);

  if (attachment.type === AttachmentType.LINK) {
    return <PinnedLinkPreview attachment={attachment} isCrop={isCrop} />;
  }

  return (
    <div
      className={`rounded overflow-hidden relative hover:scale-110 ${
        attachment.type !== AttachmentType.AUDIO
          ? `flex items-center justify-center ${sizeClass}`
          : ""
      } ${className}`}
      onClick={
        attachment.type === AttachmentType.FILE ? handleFileClick : handleClick
      }
      style={{
        cursor: "pointer",
        ...(attachment.type === AttachmentType.AUDIO
          ? { padding: 0, height: "auto" }
          : {}),
      }}
    >
      {attachment.type === AttachmentType.IMAGE ? (
        <img
          src={attachment.thumbnailUrl || attachment.url}
          alt={attachment.filename || "Image"}
          className={`object-cover w-full h-full`}
        />
      ) : attachment.type === AttachmentType.VIDEO ? (
        <>
          <div className="flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full! aspect-square w-8 h-8 overflow-hidden">
            <i className="material-symbols-outlined size-xs!">videocam</i>
          </div>
          {/* <p className="two-line-truncate text-xs break-words absolute bottom-0 left-1">
            {attachment.filename}
          </p> */}
          <video
            src={attachment.url}
            className="w-full h-full object-cover"
            muted
            preload="metadata"
          />
        </>
      ) : attachment.type === AttachmentType.AUDIO ? (
        <div
          className={` ${
            index === 0 ? "w-120" : "w-40"
          } h-8 flex justify-between items-center`}
        >
          <CustomAudioPlayer
            mediaUrl={attachment.url}
            fileName={attachment.filename ?? ""}
            attachmentType={attachment.type}
            isCompact={true}
          />
        </div>
      ) : (
        <div className="w-full h-full p-1 flex flex-col justify-between items-center">
          <div className="flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full! aspect-square w-8 h-8 overflow-hidden">
            <i className="material-symbols-outlined size-xs!">{icon}</i>
          </div>
        </div>
      )}
    </div>
  );
};

export default RenderPinnedAttachment;
