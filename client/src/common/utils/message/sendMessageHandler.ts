import { v4 as uuidv4 } from "uuid";
import { chatWebSocketService } from "@/services/websocket/chat.websocket.service";
import { useMessageStore } from "@/stores/messageStore";
import { AttachmentResponse } from "@/shared/types/responses/message.response";
import { determineAttachmentType } from "@/common/utils/message/determineAttachmentType";
import { handleError } from "../handleError";
import { uploadFilesToSupabase } from "@/common/utils/supabase/uploadToSupabase";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { CreateMessageRequest } from "@/shared/types/requests/send-message.request";
import { AttachmentUploadRequest } from "@/shared/types/requests/attachment-upload.request";
import { deleteFilesFromSupabase } from "@/common/utils/supabase/deleteFileFromSupabase";
import { toast } from "react-toastify";

function toOptimisticAttachmentResponseFromFile(
  file: File,
  previewUrl: string,
  messageId: string,
  now: string
): AttachmentResponse {
  return {
    id: uuidv4(),
    messageId,
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
  myUserId,
  myMemberId,
  inputRef,
  attachments,
  filePreviewUrls,
  replyToMessageId,
  onSuccess,
  onError,
}: {
  chatId: string;
  myUserId?: string;
  myMemberId: string;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  attachments: File[];
  filePreviewUrls: string[];
  replyToMessageId?: string | null;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  if (!myUserId || !chatId || !myMemberId) {
    toast.error("Unable to send message — user not authenticated.");
    return;
  }

  const inputValue = inputRef.current?.value || "";
  const trimmedInput = inputValue.trim();

  if (!(trimmedInput || attachments.length)) {
    toast.warn("You can’t send an empty message.");
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
        now
      )
  );

  const optimisticMessage = {
    id: messageId,
    chatId,
    sender: {
      id: myUserId,
      displayName: "Me",
      avatarUrl: "",
    },
    content: trimmedInput || null,
    status: MessageStatus.SENDING,
    isPinned: false,
    pinnedAt: null,
    replyToMessageId: replyToMessageId || null,
    replyToMessage: null,
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
    // Delete any uploaded files

    const uploadedUrls = uploadedAttachments.map((att) => att.url);
    if (uploadedUrls.length) await deleteFilesFromSupabase(uploadedUrls);

    useMessageStore.getState().updateMessageById(chatId, messageId, {
      status: MessageStatus.FAILED,
    });

    filePreviewUrls.forEach((url) => URL.revokeObjectURL(url));

    toast.error("Message upload failed. Please try again.");
    onError?.(error);
    handleError(error, "Failed to send message");
  }
}
