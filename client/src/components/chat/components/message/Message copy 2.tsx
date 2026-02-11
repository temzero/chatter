import React, { useRef, useMemo } from "react";
import clsx from "clsx";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { AnimatePresence, motion } from "framer-motion";
import { getMessageAnimation } from "@/common/animations/messageAnimations";
import { MESSAGE_AVATAR_WIDTH } from "@/common/constants/messageAvatarDimension";
import { SystemMessageJSONContent } from "../../../ui/messages/content/SystemMessageContent";
import { CallMessageContent } from "../../../ui/messages/content/CallMessageContent";
import MessageBubbleWrapper from "./wrapper/MessageBubbleWrapper";
import { useIsMobile } from "@/stores/deviceStore";
import { useReadInfo } from "@/stores/settingsStore";
import MessageReplyPreview from "@/components/ui/messages/MessageReplyPreview";
import SystemMessage from "./SystemMessage";
import MessageContent from "../../../ui/messages/content/MessageContent";
import MessageInfo from "./MessageInfo";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { getMessageWidth } from "@/common/utils/message/getMessageWidth";
import { useMessageData } from "@/common/hooks/message/useMessageData";

interface MessageProps {
  messageId: string;
  currentUserId: string;
  chatType?: ChatType;
  showInfo?: boolean;
  isRecent?: boolean;
  isRead?: boolean;
  readUserAvatars?: string[];
  isMe: boolean;
  disableAnimation?: boolean;
}

const Message: React.FC<MessageProps> = ({
  messageId,
  currentUserId,
  chatType = ChatType.DIRECT,
  showInfo = true,
  isRecent = false,
  isMe = false,
  disableAnimation = false,
}) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const readInfoSetting = useReadInfo();

  // ✅ Use the hook to get all message data
  const messageData = useMessageData({
    messageId,
    currentUserId,
  });

  const messageAnimation = useMemo(() => {
    if (disableAnimation) return {};
    const messageFromData = messageData?.message;
    return getMessageAnimation(
      isMe,
      messageFromData?.status === MessageStatus.SENDING,
    );
  }, [isMe, messageData?.message, disableAnimation]);

  // System message check - handle separately
  if (messageData?.message?.systemEvent) {
    return (
      <div className="w-full flex items-center justify-center">
        <SystemMessage
          message={messageData.message}
          systemEvent={messageData.message.systemEvent}
          senderId={messageData.sender?.id ?? ""}
          senderDisplayName={messageData.senderDisplayName}
          content={messageData.message.content as SystemMessageJSONContent}
        />
      </div>
    );
  }

  const isGroupChat = chatType === ChatType.GROUP;

  // ONLY ONE RETURN - everything inside AnimatePresence
  return (
    <AnimatePresence mode="wait">
      {messageData?.message && messageData.isVisible && (
        <motion.div
          id={`message-${messageId}`}
          ref={messageRef}
          className={clsx(
            "relative flex flex-1 my-0.5",
            isMe ? "justify-end" : "justify-start",
          )}
          style={{ 
            zIndex: messageData.isFocus || messageData.isReplyToThisMessage ? 100 : "auto" 
          }}
          layout="position"
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }} // 👈 Explicit exit animation
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
                  avatarUrl={messageData.sender?.avatarUrl}
                  name={messageData.senderDisplayName}
                  className="w-full h-full"
                />
              )}
            </div>
          )}

          <div
            className={clsx(
              "flex flex-col",
              getMessageWidth(
                isMobile, 
                messageData.hasLinkPreview, 
                messageData.attachmentLength
              ),
            )}
          >
            <div
              className={clsx("relative flex flex-col transition-all", {
                "scale-(1.1)": messageData.isReplyToThisMessage,
                "origin-bottom-right items-end": isMe,
                "origin-bottom-left items-start": !isMe,
              })}
            >
              {messageData.message.replyToMessage && (
                <MessageReplyPreview
                  replyMessage={messageData.message.replyToMessage}
                  chatType={chatType}
                  isMe={isMe}
                  currentUserId={currentUserId}
                  senderId={messageData.sender?.id ?? ""}
                  isHidden={messageData.isFocus}
                />
              )}

              <MessageBubbleWrapper
                message={messageData.message}
                isMe={isMe}
                isReplyToThisMessage={messageData.isReplyToThisMessage}
                isFocus={messageData.isFocus}
                idDisplayTail={!isRecent}
              >
                {messageData.message.call ? (
                  <CallMessageContent
                    call={messageData.message.call}
                    message={messageData.message}
                    className="justify-between p-2 pl-3"
                    iconClassName="text-3xl"
                    textClassName="font-medium"
                  />
                ) : (
                  <MessageContent
                    isMe={isMe}
                    message={messageData.message}
                    attachments={messageData.attachments}
                  />
                )}
              </MessageBubbleWrapper>
            </div>

            <MessageInfo
              message={messageData.message}
              isMe={isMe}
              isRecent={isRecent}
              isGroupChat={isGroupChat}
              senderDisplayName={messageData.senderDisplayName}
              showInfo={showInfo}
              readInfoSetting={readInfoSetting}
              currentUserId={currentUserId}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(Message);