import clsx from "clsx";
import React, { useRef, useEffect, useState, useCallback } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { AnimatePresence, motion } from "framer-motion";
import { handleSendMessage } from "@/common/utils/message/sendMessageHandler";
import { getCloseModal, useReplyToMessageId } from "@/stores/modalStore";
import { getCurrentUserId } from "@/stores/authStore";
import { useTranslation } from "react-i18next";
import EmojiPicker from "@/components/ui/EmojiPicker";
import AttachFile from "@/components/ui/attachments/AttachFile";
import AttachmentImportedPreview from "@/components/ui/attachments/AttachmentImportedPreview";
import useTypingIndicator from "@/common/hooks/useTypingIndicator";
import { useKeyDown } from "@/common/hooks/keyEvent/useKeydown";

interface ChatBarProps {
  chatId: string;
  myMemberId: string;
}

const ChatBar: React.FC<ChatBarProps> = ({ chatId, myMemberId }) => {
  const { t } = useTranslation();
  const currentUserId = getCurrentUserId();

  const closeModal = getCloseModal();
  const setDraftMessage = useMessageStore.getState().setDraftMessage;
  const getDraftMessage = useMessageStore.getState().getDraftMessage;
  const replyToMessageId = useReplyToMessageId();

  const inputRef = useRef<HTMLTextAreaElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);
  const [hasTextContent, setHasTextContent] = useState(false);

  const { clearTypingState } = useTypingIndicator(inputRef, chatId ?? null);
  const shouldShowSendButton = hasTextContent || attachedFiles.length > 0;

  useEffect(() => {
    if (chatId && inputRef.current) {
      const draft = getDraftMessage(chatId);
      inputRef.current.value = draft || "";
      setHasTextContent(!!draft?.trim());
      updateInputHeight();
    }
  }, [chatId, getDraftMessage]);

  useEffect(() => {
    const inputValueAtMount = inputRef.current?.value;
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

  const updateInputHeight = () => {
    if (inputRef.current && containerRef.current) {
      inputRef.current.style.height = "auto";
      const newHeight = Math.min(inputRef.current.scrollHeight, 100);
      inputRef.current.style.height = `${newHeight}px`;
      containerRef.current.style.height = `${newHeight + 14}px`;
    }
  };

  const handleInput = () => {
    setHasTextContent(!!inputRef.current?.value.trim());
    updateInputHeight();
  };

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        if (inputRef.current) inputRef.current.value = "";
        if (chatId) setDraftMessage(chatId, "");
        setHasTextContent(false);
        updateInputHeight();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessageAndReset({
          chatId,
          myMemberId,
          inputRef,
          attachments: attachedFiles,
          replyToMessageId,
          clearTypingState,
          setDraftMessage,
          setAttachedFiles,
          setFilePreviewUrls,
          setHasTextContent,
          setIsMessageSent,
          closeModal,
          updateInputHeight,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      chatId,
      myMemberId,
      attachedFiles,
      replyToMessageId,
      clearTypingState,
      setDraftMessage,
      closeModal,
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

  async function sendMessageAndReset({
    chatId,
    myMemberId,
    inputRef,
    attachments,
    replyToMessageId,
    clearTypingState,
    setDraftMessage,
    setAttachedFiles,
    setFilePreviewUrls,
    setHasTextContent,
    setIsMessageSent,
    closeModal,
    updateInputHeight,
  }: {
    chatId: string;
    myMemberId: string;
    inputRef: React.RefObject<HTMLTextAreaElement>;
    attachments: File[];
    replyToMessageId?: string | null;
    clearTypingState: () => void;
    setDraftMessage: (chatId: string, message: string) => void;
    setAttachedFiles: React.Dispatch<React.SetStateAction<File[]>>;
    setFilePreviewUrls: React.Dispatch<React.SetStateAction<string[]>>;
    setHasTextContent: React.Dispatch<React.SetStateAction<boolean>>;
    setIsMessageSent: React.Dispatch<React.SetStateAction<boolean>>;
    closeModal: () => void;
    updateInputHeight: () => void;
  }) {
    // Send message
    handleSendMessage({
      chatId,
      myUserId: currentUserId,
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

    // reset UI
    if (inputRef.current) inputRef.current.value = "";
    setAttachedFiles([]);
    setFilePreviewUrls([]);
    setHasTextContent(false);
    updateInputHeight();

    inputRef.current?.focus();
  }

  return (
    <div
      className="absolute bottom-0 left-0 backdrop-blur-xl w-full flex flex-col items-start p-4 shadow border-[var(--border-color)]"
      style={{ zIndex: replyToMessageId ? 100 : 2 }}
    >
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
        <AnimatePresence>
          {replyToMessageId && (
            <motion.div
              key="reply-indicator"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ transformOrigin: "top left" }}
            >
              <span className="material-symbols-outlined text-3xl rotate-180 mr-2 mb-1 pointer-events-none">
                reply
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          ref={containerRef}
          id="input-container"
          className={clsx(
            "flex gap-2 items-end w-full transition-[height] duration-200 ease-in-out",
            {
              "chat-input": !replyToMessageId,
              "chat-input-reply": replyToMessageId,
            }
          )}
        >
          <textarea
            ref={inputRef}
            defaultValue=""
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            className={clsx(
              "w-full outline-none bg-transparent resize-none overflow-hidden",
              {
                "opacity-10 transition-opacity duration-100 ease-in-out":
                  isMessageSent,
              }
            )}
            placeholder={t("chat_bar.placeholder")}
            aria-label="Message"
            rows={1}
            disabled={!chatId}
          />

          <div className="flex items-center justify-between gap-2 h-[24px]">
            {chatId && (
              <>
                <div className="flex gap-2 items-center">
                  <EmojiPicker onSelect={handleEmojiSelect} />

                  {!replyToMessageId && (
                    <AttachFile onFileSelect={handleFileSelect} />
                  )}
                </div>

                <button
                  className={clsx(
                    "rounded bg-[var(--primary-green)] border-2 border-green-400 flex items-center justify-center text-white transition-all duration-300",
                    {
                      "w-[30px] opacity-100 ml-0 pointer-events-auto":
                        shouldShowSendButton,
                      "w-0 opacity-0 -ml-2 pointer-events-none":
                        !shouldShowSendButton,
                    }
                  )}
                  onClick={() =>
                    sendMessageAndReset({
                      chatId,
                      myMemberId,
                      inputRef,
                      attachments: attachedFiles,
                      replyToMessageId,
                      clearTypingState,
                      setDraftMessage,
                      setAttachedFiles,
                      setFilePreviewUrls,
                      setHasTextContent,
                      setIsMessageSent,
                      closeModal,
                      updateInputHeight,
                    })
                  }
                  aria-label="Send message"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </>
            )}
          </div>
        </div>
        <AnimatePresence>
          {replyToMessageId && (
            <motion.div
              key="close-reply"
              initial={{ opacity: 0, scale: 0.1 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <button
                className="aspect-square overflow-hidden rounded-full opacity-70 hover:opacity-100 hover:bg-red-500 ml-2 mb-1.5"
                onClick={closeModal}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(ChatBar);
