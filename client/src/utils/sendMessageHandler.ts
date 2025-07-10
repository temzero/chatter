import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";
import {
  SendMessageRequest,
  AttachmentUploadRequest,
} from "@/types/requests/sendMessage.request";
import { convertToAttachmentPayload } from "./convertToAttachmentPayload";
import { useMessageStore } from "@/stores/messageStore";
import { MessageStatus, MessageType } from "@/types/enums/message";
import { v4 as uuidv4 } from "uuid";
import { AttachmentResponse } from "@/types/responses/message.response";
import { determineAttachmentType } from "./determineAttachmentType";

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
  if (!myUserId || !chatId || !myMemberId) return;

  const inputValue = inputRef.current?.value || "";
  const trimmedInput = inputValue.trim();

  if (!(trimmedInput || attachments.length)) return;
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
    type: MessageType.TEXT,
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

  try {
    // Upload files to Supabase
    const uploads = await Promise.all(
      attachments.map((file) => convertToAttachmentPayload(file))
    );

    const hasFailed = uploads.some((res) => res === null);
    if (hasFailed) {
      throw new Error("One or more attachments failed to upload.");
    }

    const uploadedAttachments = uploads as AttachmentUploadRequest[];

    const messagePayload: SendMessageRequest = {
      id: messageId,
      chatId,
      memberId: myMemberId,
      content: trimmedInput || undefined,
      replyToMessageId,
      attachments: uploadedAttachments,
    };

    // ✅ Send to WebSocket only if all uploads succeeded
    chatWebSocketService.sendMessage(messagePayload);
    onSuccess?.();
  } catch (error) {
    console.error("Failed to send message:", error);
    useMessageStore.getState().updateMessageById(chatId, messageId, {
      status: MessageStatus.FAILED,
    });
    onError?.(error);
  }
}
