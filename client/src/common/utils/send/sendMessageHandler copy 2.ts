import { v4 as uuidv4 } from "uuid";
import { chatWebSocketService } from "@/services/websocket/chatWebsocketService";
import { useMessageStore } from "@/stores/messageStore";
import { AttachmentResponse, ProcessedAttachment } from "@/shared/types/responses/message-attachment.response";
import { handleError } from "@/common/utils/error/handleError";
import { uploadFilesToSupabase } from "@/services/supabase/uploadFilesToSupabase";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { CreateMessageRequest } from "@/shared/types/requests/send-message.request";
import { AttachmentUploadRequest } from "@/shared/types/requests/attachment-upload.request";
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

  const now = new Date().toISOString();
  const messageId = uuidv4();

  // Process attachments in one operation
  const { filesToUpload, optimisticAttachments } = processedAttachments.reduce(
    (acc, attachment) => {
      // Extract file for upload if present
      if (attachment.file) {
        acc.filesToUpload.push(attachment.file);
      }

      // Create optimistic attachment without the file reference
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { file, ...attachmentWithoutFile } = attachment;
      acc.optimisticAttachments.push(attachmentWithoutFile);

      return acc;
    },
    {
      filesToUpload: [] as File[],
      optimisticAttachments: [] as AttachmentResponse[],
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
    createdAt: now,
    updatedAt: now,
    reactions: {},
    attachments: optimisticAttachments,
  };

  useMessageStore.getState().addMessage(optimisticMessage);
  let uploadedAttachments: AttachmentUploadRequest[] = [];

  try {
    // Upload only the files that exist
    if (filesToUpload.length > 0) {
      uploadedAttachments = await uploadFilesToSupabase(filesToUpload);
    }

    const messagePayload: CreateMessageRequest = {
      id: messageId,
      chatId,
      memberId: myMemberId,
      content,
      replyToMessageId,
      attachments: uploadedAttachments,
    };

    chatWebSocketService.sendMessage(messagePayload);

    // Revoke thumbnail URLs from processed attachments
    processedAttachments.forEach((attachment) => {
      if (attachment.thumbnailUrl) URL.revokeObjectURL(attachment.thumbnailUrl);
    });

    onSuccess?.();
  } catch (error) {
    useMessageStore.getState().updateMessageById(messageId, {
      status: MessageStatus.FAILED,
    });

    // Clean up URLs on error
    processedAttachments.forEach((attachment) => {
      if (attachment.thumbnailUrl) URL.revokeObjectURL(attachment.thumbnailUrl);
    });

    onError?.(error);

    handleError(error, "Failed to send message");
  }
}
