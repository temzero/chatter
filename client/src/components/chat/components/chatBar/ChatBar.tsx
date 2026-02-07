import clsx from "clsx";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { AnimatePresence } from "framer-motion";
import { getCloseModal, useReplyToMessageId } from "@/stores/modalStore";
import { usePasteImage } from "@/common/hooks/keyEvent/usePasteImageListener";
import { LinkPreviewCard } from "./LinkPreviewCard";
import { useIsMobile } from "@/stores/deviceStore";
import { useDetectUrl } from "@/common/hooks/useDetectUrl";
import { sendMessage } from "@/common/utils/send/sendMessageHandler";
import { useAttachmentProcessor } from "@/common/hooks/useAttachmentProcessor";
import AttachmentsImportedPreview from "@/components/ui/attachments/AttachmentsImportedPreview";
import useTypingIndicator from "@/common/hooks/useTypingIndicator";
import ChatBarLeftIcon from "./ChatBarLeftIcon";
import ChatBarInput from "./ChatBarInput";
import ChatBarSendButton from "./ChatBarSendButton";
import ChatBarVoiceInput, { ChatBarVoiceInputRef } from "./ChatBarVoiceInput";
import { useChatBarStore } from "@/stores/chatbarStore";
import { useChatBarKeydown } from "@/common/hooks/keyEvent/useChatbarKeydown";

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
  const voiceInputRef = useRef<ChatBarVoiceInputRef>(null);

  const {
    isRecordMode,
    hasTextContent,
    setIsRecordMode,
    setIsRecording,
    resetVoiceState,
    setHasTextContent,
  } = useChatBarStore();

  // Use the attachment processor hook
  const {
    processedAttachments,
    isProcessing,
    processAttachments,
    removeAttachment,
    clearAttachmentsInput,
    clearAllAttachments,
  } = useAttachmentProcessor();

  const [isMessageSent, setIsMessageSent] = useState(false);
  const [hasVoiceRecording, setHasVoiceRecording] = useState(false);

  const { clearTypingState } = useTypingIndicator(inputRef, chatId ?? null);
  const hasAttachment = processedAttachments.length > 0;
  const canSend = hasTextContent || hasAttachment || hasVoiceRecording;

  const { detectedUrl, showPreview, detectFromText, resetPreview } =
    useDetectUrl(400);

  // Reset chatBar when switching chats
  useEffect(() => {
    if (chatId && inputRef.current) {
      const draft = getDraftMessage(chatId);
      inputRef.current.value = draft || "";
      setHasTextContent(!!draft?.trim());
      requestAnimationFrame(() => {
        updateInputHeight();
      });
      clearAllAttachments();
      setHasVoiceRecording(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  // Save draft when unmounting
  useEffect(() => {
    const inputValueAtMount = inputRef.current?.value;
    console.log("inputValueAtMount", inputValueAtMount);
    return () => {
      if (chatId && inputValueAtMount) {
        setDraftMessage(chatId, inputValueAtMount);
      }
    };
  }, [chatId, setDraftMessage]);

  // Focus input when replying to a message
  useEffect(() => {
    if (replyToMessageId && inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      inputRef.current.focus();
    }
  }, [replyToMessageId]);

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

  // Handler when voice recording data becomes available
  const handleRecordingDataAvailable = useCallback(() => {
    setHasVoiceRecording(true);
  }, []);

  const handleSend = useCallback(async () => {
    if (!canSend) return;

    resetPreview();

    // Get content before clearing
    const content = inputRef.current?.value || "";
    let attachmentsToSend = [...processedAttachments].reverse();

    // Get voice recording if exists
    if (hasVoiceRecording && voiceInputRef.current) {
      const voiceFile = voiceInputRef.current.getRecordingFile();
      if (voiceFile) {
        // Process the voice file
        const voiceAttachments = await processAttachments([voiceFile], false);
        // Add to attachments list
        attachmentsToSend = [...attachmentsToSend, ...voiceAttachments];
      }
    }

    // Clear UI immediately for better UX
    if (inputRef.current) inputRef.current.value = "";
    setHasTextContent(false);
    setHasVoiceRecording(false);
    updateInputHeight();
    clearAttachmentsInput();
    resetVoiceState();

    // Send message using handler directly with processed attachments
    sendMessage({
      chatId,
      myMemberId,
      content,
      processedAttachments: attachmentsToSend,
      replyToMessageId,
      onSuccess: () => {
        clearTypingState();
        setDraftMessage(chatId, "");
        setIsMessageSent(true);
        closeModal();
        setTimeout(() => setIsMessageSent(false), 200);
      },
      onError: () => {
        clearAllAttachments();
      },
    });
  }, [
    canSend,
    resetPreview,
    processedAttachments,
    hasVoiceRecording,
    setHasTextContent,
    clearAttachmentsInput,
    chatId,
    myMemberId,
    replyToMessageId,
    clearTypingState,
    setDraftMessage,
    closeModal,
    clearAllAttachments,
    processAttachments,
    resetVoiceState,
  ]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    if (inputRef.current) {
      const currentValue = inputRef.current.value;
      const cursorPosition = inputRef.current.selectionStart || 0;

      // Insert emoji at cursor position
      const newValue =
        currentValue.slice(0, cursorPosition) +
        emoji +
        currentValue.slice(cursorPosition);

      inputRef.current.value = newValue;
      setHasTextContent(true);
      updateInputHeight();

      // Move cursor after the inserted emoji
      setTimeout(() => {
        inputRef.current?.setSelectionRange(
          cursorPosition + emoji.length,
          cursorPosition + emoji.length,
        );
      }, 0);
    }
    inputRef.current?.focus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelect = useCallback(
    async (fileList: FileList) => {
      const newFiles = Array.from(fileList);
      if (newFiles.length === 0) return;

      try {
        // Process the files using the attachment processor
        await processAttachments(newFiles);
      } catch (error) {
        console.error("Error processing attachments:", error);
        // Handle error (show toast, etc.)
      }
    },
    [processAttachments],
  );

  // Update the paste handler to use processed attachments
  usePasteImage({ inputRef, onFileSelect: handleFileSelect });

  // Use the consolidated keyboard hook
  const { handleInputKeyDown } = useChatBarKeydown({
    inputRef,
    canSend,
    isRecordMode,
    chatId,
    handleSend,
    setIsRecordMode,
    setIsRecording,
    resetVoiceState,
    setHasVoiceRecording,
    setHasTextContent,
    setDraftMessage,
    resetPreview,
  });

  return (
    <div className={clsx("chat-bottom", replyToMessageId && "has-reply")}>
      {/* File Attachment Previews using processed data */}
      {processedAttachments.length > 0 && (
        <AttachmentsImportedPreview
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
          isEnableMic={isRecordMode}
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

          {isRecordMode ? (
            <ChatBarVoiceInput
              ref={voiceInputRef}
              onRecordingDataAvailable={handleRecordingDataAvailable}
            />
          ) : (
            <ChatBarInput
              inputRef={inputRef}
              containerRef={containerRef}
              isMessageSent={isMessageSent}
              isMobile={isMobile}
              onInput={handleInput}
              onKeyDown={handleInputKeyDown}
              onEmojiSelect={handleEmojiSelect}
            />
          )}
        </div>

        <ChatBarSendButton visible={canSend} onClick={handleSend} />
      </div>
    </div>
  );
};

export default React.memo(ChatBar);
