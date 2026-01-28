// hooks/useMessageData.ts
import { useMemo } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { useMessageSender } from "@/stores/chatMemberStore";
import { useMessageFilter } from "@/common/hooks/message/useMessageFilter";
import { useMessageAttachments } from "@/stores/messageAttachmentStore";
import {
  useIsMessageFocus,
  useIsReplyToThisMessage,
} from "@/stores/modalStore";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { ChatMemberResponse } from "@/shared/types/responses/chat-member.response";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";

export interface MessageData {
  message: MessageResponse;
  sender: ChatMemberResponse | undefined;
  senderDisplayName: string;
  attachments: AttachmentResponse[];
  attachmentLength: number;
  hasLinkPreview: boolean;
  isVisible: boolean;
  isMe: boolean;
  isFocus: boolean;
  isReplyToThisMessage: boolean;
}

interface UseMessageDataProps {
  messageId: string;
  currentUserId: string;
}

export const useMessageData = ({
  messageId,
  currentUserId,
}: UseMessageDataProps): MessageData | null => {
  const message = useMessageStore((state) => state.messagesById[messageId]);

  const sender = useMessageSender(message.sender.id, message.chatId);
  const isFocus = useIsMessageFocus(messageId);
  const isReplyToThisMessage = useIsReplyToThisMessage(messageId);
  const isVisible = useMessageFilter({ message });
  const attachments = useMessageAttachments(message.chatId, message.id);

  const isMe = message.sender.id === currentUserId;
  const senderDisplayName = useMemo(
    () =>
      sender?.nickname ||
      [sender?.firstName, sender?.lastName].filter(Boolean).join(" ") ||
      message.sender.displayName,
    [sender, message.sender.displayName],
  );

  const attachmentLength = attachments.length;
  const hasLinkPreview = useMemo(
    () => attachments.some((a) => a.type === AttachmentType.LINK),
    [attachments],
  );

  const data = useMemo(
    () => ({
      message,
      sender,
      senderDisplayName,
      attachments,
      attachmentLength,
      hasLinkPreview,
      isVisible,
      isMe,
      isFocus,
      isReplyToThisMessage,
    }),
    [message, sender, senderDisplayName, attachments, attachmentLength, hasLinkPreview, isVisible, isMe, isFocus, isReplyToThisMessage],
  );

  // Early return if no message
  if (!message) {
    return null;
  }

  return data;
};
