import React from "react";
import RenderMultipleMedia from "../ui/RenderMultipleMedia";
import { formatTime } from "@/utils/formatTime";
import type { MessageResponse } from "@/types/messageResponse";

interface ChannelMessageProps {
  message: MessageResponse;
}

const ChannelMessage: React.FC<ChannelMessageProps> = ({ message }) => {
  // Convert attachments to media props if needed
  const media =
    message.attachments?.map((attachment) => ({
      url: attachment.url,
      type: attachment.type,
      thumbnailUrl: attachment.thumbnailUrl,
      width: attachment.width,
      height: attachment.height,
      duration: attachment.duration,
    })) || [];

  return (
    <div
      key={message.id}
      className="relative flex flex-col gap-1 items-center justify-center group custom-border-b"
    >
      <div className="relative py-8 w-[70%]">
        {media.length > 0 && (
          <div className="rounded overflow-hidden mb-2">
            <RenderMultipleMedia media={media} />
          </div>
        )}
        {message.content && <p>{message.content}</p>}
        <i className="material-symbols-outlined absolute -bottom-1 left-0 opacity-0 group-hover:opacity-80 transition-opacity duration-200 cursor-pointer">
          favorite
        </i>
      </div>
      <div className="absolute top-2 right-0 text-xs opacity-0 group-hover:opacity-40 z-0">
        {formatTime(message.createdAt)}
      </div>
    </div>
  );
};

export default ChannelMessage;
