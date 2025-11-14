import React from "react";
import { motion } from "framer-motion";
import { getAttachmentIcons } from "@/common/utils/getFileIcon";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { useDraftMessage } from "@/stores/messageStore";
import { CallMessageContent } from "@/components/ui/messages/content/CallMessageContent";
import {
  SystemMessageContent,
  SystemMessageJSONContent,
} from "@/components/ui/messages/content/SystemMessageContent";
import { getMessageAttachments } from "@/stores/messageAttachmentStore";

interface ChatListItemMessageProps {
  chatId?: string;
  lastMessage?: MessageResponse | null;
  unreadMessagesCount: number;
  chatType: ChatType;
  currentUserId: string;
}

/**
 * Handles rendering of the chat preview message
 * inside the ChatListItem (last message, system event, etc.)
 */
export const ChatListItemMessage: React.FC<ChatListItemMessageProps> = ({
  chatId,
  lastMessage,
  unreadMessagesCount,
  chatType,
  currentUserId,
}) => {
  const attachments = getMessageAttachments(
    chatId || "",
    lastMessage?.id || ""
  );
  const draftMessageContent = useDraftMessage(chatId);

  let displayMessage: React.ReactNode = null;

  // Draft message (highest priority)
  if (draftMessageContent) {
    displayMessage = (
      <p className="text-[var(--primary-green)] flex items-center gap-1 overflow-hidden flex-1 min-w-0">
        <i className="material-symbols-outlined flex items-center justify-center text-[16px] h-3">
          edit
        </i>
        <span className="text-xs truncate">{draftMessageContent}</span>
      </p>
    );
  } else if (lastMessage?.call) {
    displayMessage = (
      <CallMessageContent
        call={lastMessage.call}
        isBroadcast={chatType === ChatType.CHANNEL}
        className="opacity-60 flex-1 min-w-0"
      />
    );
  } else if (lastMessage?.systemEvent) {
    displayMessage = (
      <SystemMessageContent
        systemEvent={lastMessage.systemEvent}
        currentUserId={currentUserId}
        senderId={lastMessage.sender.id}
        senderDisplayName={lastMessage.sender.displayName}
        JSONcontent={lastMessage.content as SystemMessageJSONContent}
        className="gap-1 truncate opacity-60 flex-1 min-w-0"
      />
    );
  } else if (lastMessage) {
    displayMessage = (
      <p
        className={`flex items-center gap-1 text-xs min-h-6 flex-1 min-w-0 ${
          unreadMessagesCount > 0 ? "opacity-100" : "opacity-40"
        }`}
      >
        {lastMessage.sender.id === currentUserId ? (
          <strong>Me:</strong>
        ) : chatType !== ChatType.DIRECT ? (
          <strong>{lastMessage.sender.displayName.split(" ")[0]}:</strong>
        ) : null}

        {lastMessage.forwardedFromMessage && (
          <span className="material-symbols-outlined rotate-90">
            arrow_warm_up
          </span>
        )}

        {attachments?.length ? (
          <span className="flex gap-1 truncate">
            {getAttachmentIcons(attachments)?.map((icon, index) => (
              <i
                key={index}
                className="material-symbols-outlined text-base"
                aria-hidden="true"
              >
                {icon}
              </i>
            ))}
          </span>
        ) : (
          <span className="truncate">{lastMessage.content}</span>
        )}
      </p>
    );
  }

  // Nothing to show
  if (!displayMessage) return null;

  // Wrap all in motion for consistent animation
  return (
    <motion.div
      key="message"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="min-w-0"
    >
      {displayMessage}
    </motion.div>
  );
};
