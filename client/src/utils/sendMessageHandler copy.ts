import { chatWebSocketService } from "@/lib/websocket/services/chat.websocket.service";
import {
  SendMessageRequest,
  AttachmentUploadRequest,
} from "@/types/requests/sendMessage.request";
import { convertToAttachmentPayload } from "./convertToAttachmentPayload";

export async function handleSendMessage({
  chatId,
  memberId,
  inputRef,
  attachments,
  replyToMessageId,
  onSuccess,
  onError,
}: {
  chatId: string;
  memberId: string;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  attachments: File[];
  replyToMessageId?: string | null;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const inputValue = inputRef.current?.value || "";
  const trimmedInput = inputValue.trim();

  if (!(trimmedInput || attachments.length) || !chatId) return;
  if (inputRef.current) inputRef.current.value = "";

  try {
    const uploads = await Promise.all(
      attachments.map((file) => convertToAttachmentPayload(file))
    );
    const uploadedAttachments = uploads.filter(
      Boolean
    ) as AttachmentUploadRequest[];

    const messagePayload: SendMessageRequest = {
      chatId,
      memberId,
      content: trimmedInput || undefined,
      replyToMessageId,
      attachments: uploadedAttachments,
    };

    chatWebSocketService.sendMessage(messagePayload);

    onSuccess?.();
  } catch (error) {
    console.error("Failed to send message:", error);
    onError?.(error);
  }
}
