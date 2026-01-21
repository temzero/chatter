import clsx from "clsx";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { AnimatePresence } from "framer-motion";
import { useReplyToMessageId } from "@/stores/modalStore";
import { useKeyDown } from "@/common/hooks/keyEvent/useKeydown";
import { usePasteImage } from "@/common/hooks/keyEvent/usePasteImageListener";
import { sendMessageAndReset } from "@/common/utils/chat/sendMessageAndResetChatBar";
import { LinkPreviewCard } from "./LinkPreviewCard";
import { useIsMobile } from "@/stores/deviceStore";
import { useDetectUrl } from "@/common/hooks/useDetectUrl";
import AttachmentImportedPreview from "@/components/ui/attachments/AttachmentImportedPreview";
import useTypingIndicator from "@/common/hooks/useTypingIndicator";
import ChatBarLeftIcon from "./ChatBarLeftIcon";
import ChatBarInput from "./ChatBarInput";
import ChatBarSendButton from "./ChatBarSendButton";

interface ChatBarProps {
  chatId: string;
  myMemberId: string;
}

const ChatBar: React.FC<ChatBarProps> = ({ chatId, myMemberId }) => {
  const isMobile = useIsMobile();

  const setDraftMessage = useMessageStore.getState().setDraftMessage;
  const getDraftMessage = useMessageStore.getState().getDraftMessage;
  const replyToMessageId = useReplyToMessageId();

  const inputRef = useRef<HTMLTextAreaElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null!);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);
  const [hasTextContent, setHasTextContent] = useState(false);

  const { clearTypingState } = useTypingIndicator(inputRef, chatId ?? null);
  const hasAttachment = attachedFiles.length > 0;
  const showSendButton = hasTextContent || hasAttachment;

  useEffect(() => {
    if (chatId && inputRef.current) {
      const draft = getDraftMessage(chatId);

      if (draft) console.log("DRAFT", draft);

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

  // Replace this useEffect for "/" focus
  useKeyDown(
    (e) => {
      if (document.activeElement !== inputRef.current) {
        e.preventDefault(); // prevent "/" when first focus
        inputRef.current?.focus();
      }
    },
    ["/"],
    { preventDefault: false } // will not block default typing
  );

  // Replace this useEffect for ContextMenu key to open file input
  useKeyDown(() => {
    if (document.activeElement === inputRef.current) {
      const fileInput = document.querySelector(
        'input[type="file"]'
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

    // 🔥 Let the hook handle URL detection + debounce
    detectFromText(value);

    if (chatId) {
      setDraftMessage(chatId, value);
    }
  };

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
        sendMessageAndReset({
          chatId,
          myMemberId,
          inputRef,
          attachments: attachedFiles,
          filePreviewUrls,
          replyToMessageId,
          clearTypingState,
          setDraftMessage,
          setAttachedFiles,
          setFilePreviewUrls,
          setHasTextContent,
          setIsMessageSent,
          updateInputHeight,
        });
      }
    },
    [
      chatId,
      setDraftMessage,
      resetPreview,
      myMemberId,
      attachedFiles,
      filePreviewUrls,
      replyToMessageId,
      clearTypingState,
    ]
  );

  const handleEmojiSelect = useCallback((emoji: string) => {
    if (inputRef.current) {
      inputRef.current.value += emoji;
      setHasTextContent(true);
      updateInputHeight();
    }
    inputRef.current?.focus();
  }, []);

  const handleFileSelect = useCallback((fileList: FileList) => {
    const newFiles = Array.from(fileList);
    if (newFiles.length === 0) return;

    setAttachedFiles((prev) => [...prev, ...newFiles]);

    const previewPromises = newFiles.map((file) => {
      if (file.type.startsWith("video/")) {
        // ✅ Create a blob URL immediately (wrap in Promise for consistency)
        return Promise.resolve(URL.createObjectURL(file));
      } else {
        // ✅ Read image or other file as Data URL
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
    });

    Promise.all(previewPromises).then((urls) => {
      setFilePreviewUrls((prev) => [...prev, ...urls]);
    });
  }, []);

  usePasteImage({ inputRef, onFileSelect: handleFileSelect });

  return (
    <div
      className={clsx("chat-bottom", replyToMessageId && "has-reply")}
    >
      {/* File Attachment Previews */}
      {filePreviewUrls.length > 0 && (
        <AttachmentImportedPreview
          files={attachedFiles}
          urls={filePreviewUrls}
          onRemove={(index: number) => {
            setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
            setFilePreviewUrls((prev) => prev.filter((_, i) => i !== index));
          }}
        />
      )}

      <div className="flex w-full items-end">
        <ChatBarLeftIcon
          replyToMessageId={replyToMessageId}
          hasAttachment={hasAttachment}
          onFileSelect={handleFileSelect}
        />
        {/* avoid ChatBarInput expand beyond send button */}
        <div className="flex flex-col flex-1 min-w-0">
          <AnimatePresence>
            {showPreview && detectedUrl && (
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

        <ChatBarSendButton
          visible={showSendButton}
          onClick={() => {
            resetPreview();
            sendMessageAndReset({
              chatId,
              myMemberId,
              inputRef,
              attachments: attachedFiles,
              filePreviewUrls,
              replyToMessageId,
              clearTypingState,
              setDraftMessage,
              setAttachedFiles,
              setFilePreviewUrls,
              setHasTextContent,
              setIsMessageSent,
              updateInputHeight,
            });
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(ChatBar);
