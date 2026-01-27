import clsx from "clsx";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { AnimatePresence } from "framer-motion";
import { getCloseModal, useReplyToMessageId } from "@/stores/modalStore";
import { useKeyDown } from "@/common/hooks/keyEvent/useKeydown";
import { usePasteImage } from "@/common/hooks/keyEvent/usePasteImageListener";
import { LinkPreviewCard } from "./LinkPreviewCard";
import { useIsMobile } from "@/stores/deviceStore";
import { useDetectUrl } from "@/common/hooks/useDetectUrl";
import { sendMessage } from "@/common/utils/send/sendMessageHandler";
import AttachmentImportedPreview from "@/components/ui/attachments/AttachmentImportedPreview";
import useTypingIndicator from "@/common/hooks/useTypingIndicator";
import ChatBarLeftIcon from "./ChatBarLeftIcon";
import ChatBarInput from "./ChatBarInput";
import ChatBarSendButton from "./ChatBarSendButton";
import { useAttachmentProcessor } from "@/common/hooks/useAttachmentProcessor";

interface ChatBarProps {
  chatId: string;
  myMemberId: string;
}

const ChatBar: React.FC<ChatBarProps> = ({ chatId, myMemberId }) => {
  const isMobile = useIsMobile();
  const closeModal = getCloseModal();
  const setDraftMessage = useMessageStore.getState().setDraftMessage;
  const getDraftMessage = useMessageStore.getState().getDraftMessage;
  const replyToMessageId = useReplyToMessageId();

  const inputRef = useRef<HTMLTextAreaElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null!);

  const [isMessageSent, setIsMessageSent] = useState(false);
  const [hasTextContent, setHasTextContent] = useState(false);

  // Use the attachment processor hook
  const {
    processedAttachments,
    isProcessing,
    processAttachments,
    removeAttachment,
    clearAllAttachments,
    setProcessedAttachments
  } = useAttachmentProcessor();

  const { clearTypingState } = useTypingIndicator(inputRef, chatId ?? null);
  const hasAttachment = processedAttachments.length > 0;
  const showSendButton = hasTextContent || hasAttachment;

  useEffect(() => {
    if (chatId && inputRef.current) {
      const draft = getDraftMessage(chatId);
      inputRef.current.value = draft || "";
      setHasTextContent(!!draft?.trim());
      requestAnimationFrame(() => {
        updateInputHeight();
      });
    }
  }, [chatId, getDraftMessage]);

  useEffect(() => {
    const inputValueAtMount = inputRef.current?.value;
    console.log("inputValueAtMount", inputValueAtMount);
    return () => {
      if (chatId && inputValueAtMount) {
        setDraftMessage(chatId, inputValueAtMount);
      }
    };
  }, [chatId, setDraftMessage]);

  useEffect(() => {
    if (replyToMessageId && inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      inputRef.current.focus();
    }
  }, [replyToMessageId]);

  useKeyDown(
    (e) => {
      if (document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    },
    ["/"],
    { preventDefault: false },
  );

  useKeyDown(() => {
    if (document.activeElement === inputRef.current) {
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.accept = "*";
        fileInput.click();
      }
    }
  }, ["ContextMenu"]);

  const { detectedUrl, showPreview, detectFromText, resetPreview } =
    useDetectUrl(400);

  const updateInputHeight = () => {
    if (inputRef.current && containerRef.current) {
      inputRef.current.style.height = "auto";
      const newHeight = Math.min(inputRef.current.scrollHeight, 100);
      inputRef.current.style.height = `${newHeight}px`;
      containerRef.current.style.height = `${newHeight + 14}px`;
    }
  };

  const handleInput = () => {
    const value = inputRef.current?.value || "";

    setHasTextContent(!!value.trim());
    updateInputHeight();

    if (hasAttachment) {
      resetPreview();
    } else {
      detectFromText(value);
    }

    if (chatId) {
      setDraftMessage(chatId, value);
    }
  };

  const handleSend = useCallback(async () => {
    if (!(hasTextContent || hasAttachment)) return;

    resetPreview();

    // Get content before clearing
    const content = inputRef.current?.value || "";
    const attachmentsToSend = [...processedAttachments];

    // Clear UI immediately for better UX
    if (inputRef.current) inputRef.current.value = "";
    setHasTextContent(false);
    updateInputHeight();
    setProcessedAttachments([])
    // clearAllAttachments();

    // Send message using handler directly with processed attachments
    sendMessage({
      chatId,
      myMemberId,
      content,
      processedAttachments: attachmentsToSend, // Pass processed data
      replyToMessageId,
      onSuccess: () => {
        // clearAllAttachments();
        clearTypingState();
        setDraftMessage(chatId, "");
        setIsMessageSent(true);
        closeModal();
        setTimeout(() => setIsMessageSent(false), 200);
      },
    });
  }, [hasTextContent, hasAttachment, resetPreview, processedAttachments, setProcessedAttachments, chatId, myMemberId, replyToMessageId, clearTypingState, setDraftMessage, closeModal]);

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        if (inputRef.current) inputRef.current.value = "";
        if (chatId) setDraftMessage(chatId, "");
        setHasTextContent(false);
        resetPreview();
        updateInputHeight();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        resetPreview();
        handleSend();
      }
    },
    [chatId, setDraftMessage, resetPreview, handleSend],
  );

  const handleEmojiSelect = useCallback((emoji: string) => {
    if (inputRef.current) {
      inputRef.current.value += emoji;
      setHasTextContent(true);
      updateInputHeight();
    }
    inputRef.current?.focus();
  }, []);

  const handleFileSelect = useCallback(
    async (fileList: FileList) => {
      const newFiles = Array.from(fileList);
      if (newFiles.length === 0) return;

      try {
        // Process the files using the attachment processor
        await processAttachments(newFiles, chatId);
      } catch (error) {
        console.error("Error processing attachments:", error);
        // Handle error (show toast, etc.)
      }
    },
    [chatId, processAttachments],
  );

  // Update the paste handler to use processed attachments
  usePasteImage({ inputRef, onFileSelect: handleFileSelect });

  return (
    <div className={clsx("chat-bottom", replyToMessageId && "has-reply")}>
      {/* File Attachment Previews using processed data */}
      {processedAttachments.length > 0 && (
        <AttachmentImportedPreview
          processedAttachments={processedAttachments}
          isProcessing={isProcessing}
          onRemove={(index: number) => {
            const attachment = processedAttachments[index];
            if (attachment) {
              removeAttachment(attachment.id);
            }
          }}
        />
      )}

      <div className="flex w-full items-end">
        <ChatBarLeftIcon
          replyToMessageId={replyToMessageId}
          hasAttachment={hasAttachment}
          onFileSelect={handleFileSelect}
        />
        <div className="flex flex-col flex-1 min-w-0">
          <AnimatePresence>
            {/* Only show link preview if there are no attachments */}
            {showPreview && detectedUrl && !hasAttachment && (
              <div className="px-1">
                <LinkPreviewCard
                  url={detectedUrl || ""}
                  onClose={resetPreview}
                />
              </div>
            )}
          </AnimatePresence>

          <ChatBarInput
            inputRef={inputRef}
            containerRef={containerRef}
            isMessageSent={isMessageSent}
            isMobile={isMobile}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onEmojiSelect={handleEmojiSelect}
          />
        </div>

        <ChatBarSendButton visible={showSendButton} onClick={handleSend} />
      </div>
    </div>
  );
};

export default React.memo(ChatBar);
