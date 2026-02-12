import React, { useMemo } from "react";
import clsx from "clsx";
import { formatTime } from "@/common/utils/format/formatTime";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { MessageReadInfo } from "../../messagesContainer/MessageReadInfo";
import { MessageReadInfoOptions } from "@/shared/types/enums/message-setting.enum";
import { MessageResponse } from "@/shared/types/responses/message.response";

interface MessageInfoProps {
  message: MessageResponse;
  isMe: boolean;
  isRecent: boolean;
  isGroupChat: boolean;
  senderDisplayName: string;
  showInfo: boolean;
  readInfoSetting: MessageReadInfoOptions;
  currentUserId: string;
}

const MessageInfo: React.FC<MessageInfoProps> = ({
  message,
  isMe,
  isRecent,
  isGroupChat,
  senderDisplayName,
  showInfo,
  readInfoSetting,
  currentUserId,
}) => {
  const shouldShowSenderName = useMemo(
    () => !isRecent && showInfo && isGroupChat && !isMe && !!senderDisplayName,
    [isRecent, showInfo, isGroupChat, isMe, senderDisplayName]
  );

  switch (message.status) {
    case MessageStatus.FAILED:
      return (
        <h1 className="text-red-500 text-sm text-right">
          Failed to send message
        </h1>
      );

    case MessageStatus.SENDING:
      return null;
  }

  const containerClasses = clsx({
    "ml-auto": isMe,
    "mr-auto": !isMe,
    // "mb-5": !isRecent,
  });

  const shouldShowReadInfo = readInfoSetting !== MessageReadInfoOptions.NONE;

  return (
    <div className={containerClasses}>
      {!isRecent && (
        <div className="flex flex-col">
          <div className="mt-1">
            {shouldShowSenderName && (
              <h1 className="text-sm font-semibold opacity-70">
                {senderDisplayName}
              </h1>
            )}
            <p className="text-xs opacity-40">
              {formatTime(message.createdAt)}
            </p>
          </div>
        </div>
      )}

      {shouldShowReadInfo && (
        <MessageReadInfo
          chatId={message.chatId}
          currentUserId={currentUserId}
          messageId={message.id}
          isMe={isMe}
          senderName={senderDisplayName}
        />
      )}
    </div>
  );
};

export default React.memo(MessageInfo);
