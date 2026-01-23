import React, { useRef, useMemo } from "react";
import clsx from "clsx";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { motion } from "framer-motion";
import { getMessageAnimation } from "@/common/animations/messageAnimations";
import { useMessageStore } from "@/stores/messageStore";
import { MESSAGE_AVATAR_WIDTH } from "@/common/constants/messageAvatarDimension";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { getMessageAttachments } from "@/stores/messageAttachmentStore";
import { SystemMessageJSONContent } from "../../../ui/messages/content/SystemMessageContent";
import { CallMessageContent } from "../../../ui/messages/content/CallMessageContent";
import MessageBubbleWrapper from "./wrapper/MessageBubbleWrapper";
import { useMessageSender } from "@/stores/chatMemberStore";
import { useMessageFilter } from "@/common/hooks/useMessageFilter";
import { useIsMobile } from "@/stores/deviceStore";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { useReadInfo } from "@/stores/settingsStore";
import MessageReplyPreview from "@/components/ui/messages/MessageReplyPreview";
import SystemMessage from "./SystemMessage";
import MessageContent from "../../../ui/messages/content/MessageContent";
import {
  useIsMessageFocus,
  useIsReplyToThisMessage,
} from "@/stores/modalStore";
import MessageInfo from "./MessageInfo";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";

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
  const isMobile = useIsMobile();
  const message = useMessageStore((state) => state.messagesById[messageId]);
  // console.log("message", message);
  const sender = useMessageSender(message?.sender.id, message?.chatId);
  const senderDisplayName =
    sender?.nickname ||
    [sender?.firstName, sender?.lastName].filter(Boolean).join(" ") ||
    message.sender.displayName;

  const call = message.call;

  const readInfoSetting = useReadInfo();

  const attachments = getMessageAttachments(message.chatId, message.id);
  const attachmentLength = attachments.length;

  const isFocus = useIsMessageFocus(messageId);
  const isReplyToThisMessage = useIsReplyToThisMessage(messageId);

  const messageRef = useRef<HTMLDivElement>(null);

  const isGroupChat = chatType === ChatType.GROUP;

  // Safe animation setup
  const messageAnimation = useMemo(() => {
    if (!message) return;
    return getMessageAnimation(isMe, message.status === MessageStatus.SENDING);
  }, [message, isMe]);

  const isVisible = useMessageFilter({ message });

  if (!isVisible) {
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

  const hasLinkPreview = attachments.some(
    (a) => a.type === AttachmentType.LINK,
  );

  const getMessageWidth = (
    isMobile: boolean,
    hasLinkPreview: boolean,
    attachmentLength: number,
  ): string => {
    if (isMobile) {
      return hasLinkPreview
        ? "w-[80%]"
        : attachmentLength === 1
          ? "w-[60%]"
          : "w-[80%]";
    }
    return hasLinkPreview
      ? "w-[60%]"
      : attachmentLength === 1
        ? "w-[40%]"
        : "w-[60%]";
  };

  return (
    <motion.div
      id={`message-${messageId}`}
      ref={messageRef}
      className={clsx(
        "relative flex",
        isMe ? "justify-end" : "justify-start",
        getMessageWidth(isMobile, hasLinkPreview, attachmentLength),
      )}
      style={{ zIndex: isFocus || isReplyToThisMessage ? 100 : "auto" }}
      layout="position"
      {...messageAnimation}
    >
      {isGroupChat && !isMe && (
        <div
          className="mt-auto pb-4"
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
            "scale-(1.1)": isReplyToThisMessage,
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
            isReplyToThisMessage={isReplyToThisMessage}
            isFocus={isFocus}
            className={hasLinkPreview ? "w-full" : ""}
            idDisplayTail={!isRecent}
          >
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
                currentUserId={currentUserId ?? ""}
              />
            )}
          </MessageBubbleWrapper>
        </div>

        <MessageInfo
          message={message}
          isMe={isMe}
          isRecent={isRecent}
          isGroupChat={isGroupChat}
          senderDisplayName={senderDisplayName}
          showInfo={showInfo}
          readInfoSetting={readInfoSetting}
          chat={chat}
          currentUserId={currentUserId}
        />
      </div>
    </motion.div>
  );
};

export default React.memo(Message);
