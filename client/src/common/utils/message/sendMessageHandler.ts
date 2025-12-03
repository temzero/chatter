import { v4 as uuidv4 } from "uuid";
import { chatWebSocketService } from "@/services/websocket/chatWebsocketService";
import { useMessageStore } from "@/stores/messageStore";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { determineAttachmentType } from "@/common/utils/message/determineAttachmentType";
import { handleError } from "@/common/utils/error/handleError";
import { uploadFilesToSupabase } from "@/services/supabase/uploadFilesToSupabase";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { CreateMessageRequest } from "@/shared/types/requests/send-message.request";
import { AttachmentUploadRequest } from "@/shared/types/requests/attachment-upload.request";
import { getCurrentUserId } from "@/stores/authStore";

function toOptimisticAttachmentResponseFromFile(
  file: File,
  previewUrl: string,
  messageId: string,
  chatId: string,
  now: string
): AttachmentResponse {
  return {
    id: uuidv4(),
    messageId,
    chatId,
    url: previewUrl,
    type: determineAttachmentType(file),
    filename: file.name,
    size: file.size,
    mimeType: file.type || null,
    width: null,
    height: null,
    duration: null,
    thumbnailUrl: null,
    metadata: null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function handleSendMessage({
  chatId,
  myMemberId,
  inputRef,
  attachments,
  filePreviewUrls,
  replyToMessageId,
  onSuccess,
  onError,
}: {
  chatId: string;
  myMemberId: string;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  attachments: File[];
  filePreviewUrls: string[];
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

  const inputValue = inputRef.current?.value || "";
  const trimmedInput = inputValue.trim();

  if (!(trimmedInput || attachments.length)) {
    return;
  }
  if (inputRef.current) inputRef.current.value = "";

  const now = new Date().toISOString();
  const messageId = uuidv4();

  // Create optimistic UI message
  const optimisticAttachments: AttachmentResponse[] = attachments.map(
    (file, index) =>
      toOptimisticAttachmentResponseFromFile(
        file,
        filePreviewUrls[index],
        messageId,
        chatId,
        new Date(Date.now() + index).toISOString()
      )
  );

  const optimisticMessage = {
    id: messageId,
    chatId,
    sender: {
      id: currentUserId,
      displayName: "Me",
      avatarUrl: "",
    },
    content: trimmedInput || null,
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
    uploadedAttachments = await uploadFilesToSupabase(attachments);

    const messagePayload: CreateMessageRequest = {
      id: messageId,
      chatId,
      memberId: myMemberId,
      content: trimmedInput || undefined,
      replyToMessageId,
      attachments: uploadedAttachments,
    };

    chatWebSocketService.sendMessage(messagePayload);

    // Revoke previews
    filePreviewUrls.forEach((url) => URL.revokeObjectURL(url));

    onSuccess?.();
  } catch (error) {
    useMessageStore.getState().updateMessageById(messageId, {
      status: MessageStatus.FAILED,
    });

    filePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    onError?.(error);

    handleError(error, "Failed to send message");
  }
}
