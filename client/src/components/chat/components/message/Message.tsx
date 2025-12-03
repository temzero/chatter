import React, { useState, useRef, useMemo } from "react";
import clsx from "clsx";
import { formatTime } from "@/common/utils/format/formatTime";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { MessageReactionDisplay } from "@/components/ui/messages/MessageReactionsDisplay";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import {
  useIsMessageFocus,
  useIsReplyToThisMessage,
  setOpenFocusMessageModal,
} from "@/stores/modalStore";
import MessageReplyPreview from "@/components/ui/messages/MessageReplyPreview";
import SystemMessage from "./SystemMessage";
import MessageContent from "../../../ui/messages/content/MessageContent";
import { AnimatePresence, motion } from "framer-motion";
import { getMessageAnimation } from "@/common/animations/messageAnimations";
import { chatWebSocketService } from "@/services/websocket/chatWebsocketService";
import { useMessageStore } from "@/stores/messageStore";
import { MESSAGE_AVATAR_WIDTH } from "@/common/constants/messageAvatarDimension";
import { MessageReadInfo } from "../../messagesContainer/MessageReadInfo";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { getMessageAttachments } from "@/stores/messageAttachmentStore";
import { SystemMessageJSONContent } from "../../../ui/messages/content/SystemMessageContent";
import { CallMessageContent } from "../../../ui/messages/content/CallMessageContent";
import MessageBubbleWrapper from "./wrapper/MessageBubbleWrapper";
import { useMessageSender } from "@/stores/chatMemberStore";
import { MessageContextMenu } from "../../../ui/contextMenu/Message-contextMenu";

interface MessageProps {
  messageId: string;
  currentUserId: string;
  chatType?: ChatType;
  showInfo?: boolean;
  isRecent?: boolean;
  isRead?: boolean;
  readUserAvatars?: string[];
  isMe?: boolean;
  chat: ChatResponse;
}

const Message: React.FC<MessageProps> = ({
  messageId,
  currentUserId,
  chatType = ChatType.DIRECT,
  showInfo = true,
  isRecent = false,
  isMe = false,
  chat,
}) => {
  const message = useMessageStore((state) => state.messagesById[messageId]);
  const sender = useMessageSender(message?.sender.id, message?.chatId);
  const senderDisplayName =
    sender?.nickname ||
    [sender?.firstName, sender?.lastName].filter(Boolean).join(" ") ||
    message.sender.displayName;

  const call = message.call;

  const attachments = getMessageAttachments(message.chatId, message.id);
  const attachmentLength = attachments.length;

  const searchQuery = useMessageStore((state) => state.searchQuery);
  const showImportantOnly = useMessageStore((state) => state.showImportantOnly);

  const isFocus = useIsMessageFocus(messageId);
  const isRelyToThisMessage = useIsReplyToThisMessage(messageId);

  const messageRef = useRef<HTMLDivElement>(null);
  const [contextMenuMousePos, setContextMenuMousePos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenFocusMessageModal(messageId);
    setContextMenuMousePos({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenuMousePos(null);

  const isGroupChat = chatType === ChatType.GROUP;

  // Safe animation setup
  const messageAnimation = useMemo(() => {
    if (!message) return {};
    return getMessageAnimation(isMe);
  }, [message, isMe]);

  // Safe content checks
  const contentText = message?.content?.toString().toLowerCase() ?? "";
  const notMatchingSearch =
    searchQuery.trim() !== "" &&
    !contentText.includes(searchQuery.toLowerCase());
  const notImportant = showImportantOnly && !message?.isImportant;

  if (!message || notMatchingSearch || notImportant) {
    return null;
  }

  // System message check
  if (message.systemEvent) {
    return (
      <div className="w-full flex items-center justify-center">
        <SystemMessage
          message={message}
          systemEvent={message.systemEvent}
          senderId={sender?.id ?? ""}
          senderDisplayName={senderDisplayName ?? ""}
          content={message.content as SystemMessageJSONContent}
        />
      </div>
    );
  }

  const repliedMessage = message.replyToMessage;

  return (
    <motion.div
      id={`message-${messageId}`}
      ref={messageRef}
      onContextMenu={handleContextMenu}
      className={clsx("relative", {
        "ml-auto": isMe,
        "mr-auto": !isMe,
        "max-w-[40%]": attachmentLength === 1,
        "max-w-[60%]": attachmentLength !== 1,
      })}
      style={{ zIndex: isFocus || isRelyToThisMessage ? 100 : "auto" }}
      layout="position"
      {...messageAnimation}
    >
      {isGroupChat && !isMe && (
        <div
          className="mt-auto pb-2"
          style={{
            width: MESSAGE_AVATAR_WIDTH,
            minWidth: MESSAGE_AVATAR_WIDTH,
            marginRight: 8,
          }}
        >
          {!isRecent && (
            <Avatar
              avatarUrl={sender?.avatarUrl}
              name={senderDisplayName ?? ""}
              className="w-full h-full"
            />
          )}
        </div>
      )}

      <div className="flex flex-col">
        <div
          className={clsx("relative flex flex-col transition-all", {
            "scale-(1.1)": isRelyToThisMessage,
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
              senderId={sender?.id ?? ""}
              isHidden={isFocus}
            />
          )}

          <MessageBubbleWrapper
            message={message}
            isMe={isMe}
            isRelyToThisMessage={isRelyToThisMessage}
            attachmentLength={attachmentLength}
          >
            {/* <div className="overflow-hidden rounded-lg"> */}
            {call ? (
              <CallMessageContent
                call={call}
                message={message}
                className="justify-between p-2 pl-3"
                iconClassName="text-3xl"
                textClassName="font-medium"
              />
            ) : (
              <MessageContent
                message={message}
                isMe={isMe}
                isRelyToThisMessage={isRelyToThisMessage}
                currentUserId={currentUserId ?? ""}
              />
            )}
            {/* </div> */}
          </MessageBubbleWrapper>
          <MessageReactionDisplay
            isMe={isMe}
            currentUserId={currentUserId}
            messageId={messageId}
            chatId={message.chatId}
          />

          {message.isPinned && (
            <div
              className={clsx(
                "absolute top-0 text-red-400 rounded-full! cursor-pointer hover:scale-110 transition-all",
                {
                  "-left-5 -rotate-45": isMe,
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

          <AnimatePresence>
            {isFocus && !isRelyToThisMessage && contextMenuMousePos && (
              <MessageContextMenu
                key={messageId}
                message={message}
                isMe={isMe}
                isSystemMessage={!!message.systemEvent}
                initialMousePosition={contextMenuMousePos}
                onClose={closeContextMenu}
              />
            )}
          </AnimatePresence>
        </div>

        {showInfo && isGroupChat && !isMe && (
          <h1 className="text-sm font-semibold opacity-70 mr-2 mt-1">
            {senderDisplayName ?? ""}
          </h1>
        )}

        {message.status !== MessageStatus.SENDING &&
          message.status !== MessageStatus.FAILED && (
            <div
              className={clsx("px-0.5", {
                "ml-auto": isMe,
                "mr-auto": !isMe,
                "mb-5": !isRecent,
              })}
            >
              {!isRecent && (
                <p
                  className={clsx("text-xs opacity-40 pt-1", {
                    "text-right": isMe,
                    "text-left": !isMe,
                  })}
                >
                  {formatTime(message.createdAt)}
                </p>
              )}
              <MessageReadInfo
                chatId={chat.id}
                currentUserId={currentUserId}
                messageId={message.id}
                isMe={isMe}
                senderName={senderDisplayName}
              />
            </div>
          )}

        {message.status === MessageStatus.FAILED && (
          <h1 className="text-red-500 text-sm text-right">
            Failed to send message
          </h1>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(Message);
