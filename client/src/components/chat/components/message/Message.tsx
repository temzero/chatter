import React, { useState, useRef } from "react";
import clsx from "clsx";
import { formatTime } from "@/common/utils/formatTime";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { MessageReactionDisplay } from "@/components/ui/MessageReactionsDisplay";
import MessageReplyPreview from "@/components/ui/MessageReplyPreview";
import { handleQuickReaction } from "@/common/utils/quickReaction";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { BeatLoader } from "react-spinners";
import { SystemMessageJSONContent } from "@/components/ui/SystemMessageContent";
import SystemMessage from "./SystemMessage";
import { MessageContextMenu } from "./MessageContextMenu";
import type { MessageResponse } from "@/shared/types/responses/message.response";
import {
  useIsMessageFocus,
  useIsReplyToThisMessage,
  useModalStore,
} from "@/stores/modalStore";

// ✅ new
import MessageBubble from "./MessageBubble";
import CallMessageBubble from "./CallMessageBubble";
import { SystemEventType } from "@/shared/types/enums/system-event-type.enum";
import { motion } from "framer-motion";
import { getMessageAnimation } from "@/common/animations/messageAnimations";
import { chatWebSocketService } from "@/services/websocket/chat.websocket.service";

interface MessageProps {
  message: MessageResponse;
  chatType?: ChatType;
  showInfo?: boolean;
  isRecent?: boolean;
  isRead?: boolean;
  readUserAvatars?: string[];
  currentUserId?: string;
  isMe?: boolean;
}

const Message: React.FC<MessageProps> = ({
  message,
  chatType = ChatType.DIRECT,
  showInfo = true,
  isRecent = false,
  readUserAvatars,
  currentUserId,
  isMe = false,
}) => {
  const isRelyToThisMessage = useIsReplyToThisMessage(message.id);
  const isFocus = useIsMessageFocus(message.id);

  const repliedMessage = message.replyToMessage;

  const openMessageModal = useModalStore((state) => state.openMessageModal);
  const messageRef = useRef<HTMLDivElement>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openMessageModal(message.id);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => {
    setContextMenuPosition(null);
  };

  const isGroupChat = chatType === "group";

  // system message
  if (message.systemEvent && message.systemEvent != SystemEventType.CALL) {
    return (
      <div className="w-full flex items-center justify-center">
        <SystemMessage
          message={message}
          systemEvent={message.systemEvent}
          senderId={message.sender.id}
          senderDisplayName={message.sender.displayName}
          content={message.content as SystemMessageJSONContent}
        />
      </div>
    );
  }

  return (
    <motion.div
      id={`message-${message.id}`}
      ref={messageRef}
      onDoubleClick={() => handleQuickReaction(message.id, message.chatId)}
      onContextMenu={handleContextMenu}
      className={clsx("flex relative max-w-[60%]", {
        "justify-end": isMe,
        "justify-start": !isMe,
        "pb-1": isRecent,
        "pb-2": !isRecent,
      })}
      style={{
        zIndex: isFocus ? 100 : "auto",
      }}
      layout="position"
      {...getMessageAnimation(isMe)}
    >
      {isGroupChat && !isMe && (
        <div className={clsx("flex-shrink-0 mt-auto mr-2 h-10 w-10 min-w-10")}>
          {!isRecent && (
            <Avatar
              avatarUrl={message.sender.avatarUrl}
              name={message.sender.displayName}
            />
          )}
        </div>
      )}

      <div className="flex flex-col ">
        <div
          className={clsx("relative flex flex-col transition-all", {
            "scale-[1.1]": isRelyToThisMessage,
            "origin-bottom-right items-end": isMe,
            "origin-bottom-left items-start": !isMe,
          })}
        >
          {repliedMessage && (
            <MessageReplyPreview
              replyMessage={repliedMessage}
              chatType={chatType}
              isMe={isMe}
              currentUserId={currentUserId ?? ""}
              senderId={message.sender.id}
              isHidden={isFocus}
            />
          )}

          <div className="relative">
            {/* ✅ choose correct bubble */}
            {message.call ? (
              <CallMessageBubble message={message} isMe={isMe} />
            ) : (
              <MessageBubble
                message={message}
                isMe={isMe}
                isRelyToThisMessage={isRelyToThisMessage}
                currentUserId={currentUserId ?? ""}
              />
            )}

            <MessageReactionDisplay
              isMe={isMe}
              currentUserId={currentUserId}
              messageId={message.id}
              chatId={message.chatId}
            />

            {isFocus && !isRelyToThisMessage && (
              <MessageContextMenu
                message={message}
                isMe={isMe}
                position={contextMenuPosition || undefined}
                onClose={closeContextMenu}
              />
            )}

            {message.isPinned && (
              <div
                className={clsx(
                  "absolute top-0 text-red-400 rounded-full cursor-pointer hover:scale-110 transition-all",
                  {
                    "-left-5 rotate-[-45deg]": isMe,
                    "-right-5 rotate-45": !isMe,
                  }
                )}
                onClick={() => {
                  chatWebSocketService.togglePinMessage({
                    chatId: message.chatId,
                    messageId: null,
                  });
                }}
              >
                <span className="material-symbols-outlined filled">keep</span>
              </div>
            )}
          </div>
        </div>

        {showInfo && isGroupChat && !isMe && (
          <h1 className={clsx("text-sm font-semibold opacity-70 mr-2")}>
            {message.sender.displayName}
          </h1>
        )}

        {!isRecent &&
          message.status !== MessageStatus.SENDING &&
          message.status !== MessageStatus.FAILED && (
            <p
              className={clsx("text-xs py-1 opacity-40", {
                "ml-auto": isMe,
                "mr-auto": !isMe,
              })}
            >
              {formatTime(message.createdAt)}
            </p>
          )}

        {message.status === MessageStatus.SENDING && (
          <div className="rounded-full flex justify-end mt-1">
            <BeatLoader color="gray" size={8} />
          </div>
        )}
        {message.status === MessageStatus.FAILED && (
          <h1 className="text-red-500 text-sm text-right">
            Failed to send message
          </h1>
        )}

        {readUserAvatars && (
          <div
            className={clsx("flex items-center ", {
              "justify-end": isMe,
              "justify-start": !isMe,
            })}
          >
            {readUserAvatars.map((avatarUrl, index) => (
              <div key={index}>
                <Avatar
                  avatarUrl={avatarUrl}
                  name={message.sender.displayName}
                  size="5"
                  id={index}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(Message);
