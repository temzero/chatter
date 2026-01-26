// --- helper function outside component ---
import { sendMessage } from "@/common/utils/send/sendMessageHandler";
import { getCloseModal } from "@/stores/modalStore";

interface SendMessageAndResetParams {
  chatId: string;
  myMemberId: string;
  content?: string;
  attachments: File[];
  filePreviewUrls: string[];
  
  replyToMessageId?: string | null;
  clearTypingState: () => void;
  setDraftMessage: (chatId: string, message: string) => void;
  setAttachedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setFilePreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
  setHasTextContent: React.Dispatch<React.SetStateAction<boolean>>;
  setIsMessageSent: React.Dispatch<React.SetStateAction<boolean>>;
  updateInputHeight: () => void;
}

export async function sendMessageAndReset({
  chatId,
  myMemberId,
  content,
  attachments,
  filePreviewUrls,
  replyToMessageId,
  clearTypingState,
  setDraftMessage,
  setAttachedFiles,
  setFilePreviewUrls,
  setHasTextContent,
  setIsMessageSent,
  updateInputHeight,
}: SendMessageAndResetParams) {
  const closeModal = getCloseModal();

  try {
    sendMessage({
      chatId,
      myMemberId,
      content,
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

    setAttachedFiles([]);
    setFilePreviewUrls([]);
    setHasTextContent(false);
    updateInputHeight();
  } catch (err) {
    console.error("Failed to send message:", err);
  }
}
