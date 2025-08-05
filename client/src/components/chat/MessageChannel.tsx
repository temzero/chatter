import React from "react";
import RenderMultipleAttachments from "../ui/RenderMultipleAttachments";
import { formatTime } from "@/utils/formatTime";
import type { MessageResponse } from "@/types/responses/message.response";
import SystemMessage, { SystemMessageContent } from "./SystemMessage";

interface ChannelMessageProps {
  message: MessageResponse;
}

const ChannelMessage: React.FC<ChannelMessageProps> = ({ message }) => {
  // Check if the message is a system message
  const isSystemMessage = !!message.systemEvent;

  if (isSystemMessage) {
    return (
      <div className="p-1 w-full flex items-center justify-center">
        <SystemMessage
          message={message}
          systemEvent={message.systemEvent}
          senderId={message.sender.id}
          senderDisplayName={message.sender.displayName}
          content={message.content as SystemMessageContent}
        />
      </div>
    );
  }

  const attachments = message.attachments ?? [];

  return (
    <div
      key={message.id}
      className="relative flex flex-col gap-1 items-center justify-center group custom-border-b"
    >
      <div className="relative py-8 w-[70%]">
        {attachments.length > 0 && (
          <div className="rounded overflow-hidden mb-2">
            <RenderMultipleAttachments attachments={attachments} />
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
