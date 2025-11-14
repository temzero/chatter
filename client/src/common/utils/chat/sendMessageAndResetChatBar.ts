// --- helper function outside component ---
import { handleSendMessage } from "@/common/utils/message/sendMessageHandler";

interface SendMessageAndResetParams {
  chatId: string;
  myMemberId: string;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  attachments: File[];
  filePreviewUrls: string[];
  replyToMessageId?: string | null;
  clearTypingState: () => void;
  setDraftMessage: (chatId: string, message: string) => void;
  setAttachedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setFilePreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
  setHasTextContent: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMessageSent: React.Dispatch<React.SetStateAction<boolean>>;
  closeModal: () => void;
  updateInputHeight: () => void;
}

export async function sendMessageAndReset({
  chatId,
  myMemberId,
  inputRef,
  attachments,
  filePreviewUrls,
  replyToMessageId,
  clearTypingState,
  setDraftMessage,
  setAttachedFiles,
  setFilePreviewUrls,
  setHasTextContent,
  setIsMessageSent,
  closeModal,
  updateInputHeight,
}: SendMessageAndResetParams) {
  try {
    handleSendMessage({
      chatId,
      myMemberId,
      inputRef,
      attachments,
      filePreviewUrls,
      replyToMessageId,
      onSuccess: () => {
        clearTypingState();
        setDraftMessage(chatId, "");
        setIsMessageSent(true);
        closeModal();
        setTimeout(() => setIsMessageSent(false), 200);
      },
    });

    // reset UI state
    if (inputRef.current) inputRef.current.value = "";
    setAttachedFiles([]);
    setFilePreviewUrls([]);
    setHasTextContent(false);
    updateInputHeight();
    inputRef.current?.focus();
  } catch (err) {
    console.error("Failed to send message:", err);
  }
}
