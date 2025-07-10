import React, { useRef, useEffect, useState, useCallback } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { AnimatePresence, motion } from "framer-motion";
import EmojiPicker from "../ui/EmojiPicker";
import AttachFile from "../ui/AttachFile";
import AttachmentImportedPreview from "../ui/AttachmentImportedPreview";
import useTypingIndicator from "@/hooks/useTypingIndicator";
import { handleSendMessage } from "@/utils/sendMessageHandler";
import { useModalStore, useReplyToMessageId } from "@/stores/modalStore";
import clsx from "clsx";
import { useCurrentUserId } from "@/stores/authStore";

interface ChatBarProps {
  chatId: string;
  myMemberId: string;
}

const ChatBar: React.FC<ChatBarProps> = ({ chatId, myMemberId }) => {
  const currentUserId = useCurrentUserId();

  const setDraftMessage = useMessageStore((state) => state.setDraftMessage);
  const getDraftMessage = useMessageStore((state) => state.getDraftMessage);
  const closeModal = useModalStore((state) => state.closeModal);
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
    inputRef.current?.focus();
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (replyToMessageId && inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      inputRef.current.focus();
    }
  }, [replyToMessageId]);

  // Open attachFile without open menu
  useEffect(() => {
    const handleMenuKey = (e: KeyboardEvent) => {
      if (e.key === "ContextMenu") {
        if (document.activeElement === inputRef.current) {
          e.preventDefault();
          e.stopPropagation();

          const fileInput = document.querySelector(
            'input[type="file"]'
          ) as HTMLInputElement;
          if (fileInput) {
            fileInput.accept = "*";
            fileInput.click();
          }

          return false;
        }
      }
    };

    document.addEventListener("keydown", handleMenuKey, {
      capture: true,
      passive: false,
    });

    return () => {
      document.removeEventListener("keydown", handleMenuKey, {
        capture: true,
      });
    };
  }, []);

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

    const newPreviews: string[] = [];
    let loadedCount = 0;

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        loadedCount++;
        if (loadedCount === newFiles.length) {
          setFilePreviewUrls((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
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
      className={clsx(
        "absolute bottom-0 left-0 backdrop-blur-xl w-full flex flex-col items-center p-4 justify-between shadow border-[var(--border-color)]",
        replyToMessageId ? "z-[999]" : "z-40"
      )}
    >
      {filePreviewUrls.length > 0 && (
        <AttachmentImportedPreview
          files={attachedFiles}
          urls={filePreviewUrls}
          onRemove={(index) => {
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
            placeholder={
              chatId ? "Message..." : "Select a chat to start messaging"
            }
            aria-label="Message"
            rows={1}
            disabled={!chatId}
          />

          <div className="flex items-center justify-between gap-2 h-[24px]">
            {chatId && (
              <>
                <motion.div
                  className="flex gap-2 items-center"
                  animate={{
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    },
                  }}
                >
                  <EmojiPicker onSelect={handleEmojiSelect} />

                  {!replyToMessageId && (
                    <AttachFile onFileSelect={handleFileSelect} />
                  )}
                </motion.div>

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
