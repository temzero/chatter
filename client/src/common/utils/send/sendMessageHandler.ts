import { v4 as uuidv4 } from "uuid";
import { chatWebSocketService } from "@/services/websocket/chatWebsocketService";
import { useMessageStore } from "@/stores/messageStore";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { handleError } from "@/common/utils/error/handleError";
import { uploadAttachmentsToSupabase } from "@/services/supabase/uploadAttachmentsToSupabase"; // Changed import
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { CreateMessageRequest } from "@/shared/types/requests/send-message.request";
import {
  AttachmentUploadRequest,
  ProcessedAttachment,
} from "@/shared/types/requests/attachment-upload.request";
import { getCurrentUserId } from "@/stores/authStore";

export async function sendMessage({
  chatId,
  myMemberId,
  content,
  processedAttachments,
  replyToMessageId,
  onSuccess,
  onError,
}: {
  chatId: string;
  myMemberId: string;
  content?: string;
  processedAttachments: ProcessedAttachment[];
  replyToMessageId?: string | null;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const currentUserId = getCurrentUserId();

  let replyToMessage = null;
  if (replyToMessageId) {
    replyToMessage = useMessageStore
      .getState()
      .getMessageById(replyToMessageId);
    console.log("replyToMessage", replyToMessage);
  }

  if (!currentUserId || !chatId || !myMemberId) {
    console.error("Unable to send message — user not authenticated.");
    return;
  }

  const nowTimeStamp = new Date().toISOString();
  const messageId = uuidv4();

  // Process attachments in one operation
  const optimisticAttachments: AttachmentResponse[] = processedAttachments.map(
    (attachment, index) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { file, ...attachmentWithoutFile } = attachment;
      const timestamp = new Date(Date.now() + index).toISOString();

      return {
        ...attachmentWithoutFile, // id, type, url, filename, etc.
        messageId: messageId, // CRITICAL: Add real message ID
        chatId: chatId, // CRITICAL: Add real chat ID
        createdAt: timestamp, // Same timestamp for all
        updatedAt: timestamp, // Same timestamp for all
      };
    },
  );

  const optimisticMessage = {
    id: messageId,
    chatId,
    sender: {
      id: currentUserId,
      displayName: "Me",
      avatarUrl: "",
    },
    content,
    status: MessageStatus.SENDING,
    isPinned: false,
    pinnedAt: null,
    replyToMessageId: replyToMessageId || null,
    replyToMessage: replyToMessage || null,
    replyCount: 0,
    forwardedFromMessageId: null,
    forwardedFromMessage: null,
    editedAt: null,
    isDeleted: false,
    deletedAt: null,
    createdAt: nowTimeStamp,
    updatedAt: nowTimeStamp,
    reactions: {},
    attachments: optimisticAttachments,
  };

  useMessageStore.getState().addMessage(optimisticMessage);
  let uploadedAttachments: AttachmentUploadRequest[] = [];

  try {
    // Upload attachments (files + thumbnails) using the new function
    if (processedAttachments.length > 0) {
      // This will:
      // 1. Upload main files to Supabase
      // 2. Upload thumbnails to Supabase
      // 3. Return AttachmentUploadRequest[] with permanent thumbnail URLs
      uploadedAttachments =
        await uploadAttachmentsToSupabase(processedAttachments);
    }

    console.log("processedAttachments", processedAttachments)
    console.log("uploadedAttachments", uploadedAttachments)

    const messagePayload: CreateMessageRequest = {
      id: messageId,
      chatId,
      memberId: myMemberId,
      content,
      replyToMessageId,
      attachments: uploadedAttachments, // Now includes permanent thumbnail URLs from Supabase
    };

    console.log('messagePayload before send', messagePayload)

    chatWebSocketService.sendMessage(messagePayload);

    // STATUS: SEND updated via chatSocketListener

    onSuccess?.();
  } catch (error) {
    useMessageStore.getState().updateMessageById(messageId, {
      status: MessageStatus.FAILED,
    });

    onError?.(error);
    handleError(error, "Failed to send message");
  }
}
