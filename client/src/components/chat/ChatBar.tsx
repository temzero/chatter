import React, { useRef, useEffect, useState, useCallback } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { motion } from "framer-motion";
import EmojiPicker from "../ui/EmojiPicker";
import AttachFile from "../ui/AttachFile";
import FileImportPreviews from "../ui/FileImportPreview";
import useTypingIndicator from "@/hooks/useTypingIndicator";
import ReplyToMessage from "../ui/ReplyToMessage";
import { handleSendMessage } from "@/utils/sendMessageHandler";

interface ChatBarProps {
  chatId: string;
  memberId: string;
}

const ChatBar: React.FC<ChatBarProps> = ({ chatId, memberId }) => {
  const setDraftMessage = useMessageStore((state) => state.setDraftMessage);
  const getDraftMessage = useMessageStore((state) => state.getDraftMessage);

  const replyToMessage = useMessageStore((state) => state.replyToMessage);
  const replyToMessageId = replyToMessage?.id || null;
  const setReplyToMessage = useMessageStore((state) => state.setReplyToMessage);

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
    if (replyToMessage && inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      inputRef.current.focus();
    }
  }, [replyToMessage]);

  useEffect(() => {
    setAttachedFiles([]);
    setFilePreviewUrls([]);
  }, [chatId]);

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
        await handleSendMessage({
          chatId,
          memberId,
          inputRef,
          attachments: attachedFiles,
          replyToMessageId,
          onSuccess: () => {
            clearTypingState();
            setDraftMessage(chatId, "");
            setAttachedFiles([]);
            setFilePreviewUrls([]);
            setHasTextContent(false);
            setIsMessageSent(true);
            setReplyToMessage(null);
            setTimeout(() => setIsMessageSent(false), 200);
            updateInputHeight();
          },
        });
        inputRef.current?.focus();
      }
    },
    [
      chatId,
      memberId,
      attachedFiles,
      replyToMessageId,
      clearTypingState,
      setDraftMessage,
      setReplyToMessage,
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

  return (
    <div className="absolute bottom-0 left-0 backdrop-blur-xl w-full flex flex-col items-center p-4 justify-between shadow border-[var(--border-color)] z-40">
      {filePreviewUrls.length > 0 && (
        <FileImportPreviews
          files={attachedFiles}
          urls={filePreviewUrls}
          onRemove={(index) => {
            setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
            setFilePreviewUrls((prev) => prev.filter((_, i) => i !== index));
          }}
        />
      )}

      {replyToMessage && (
        <ReplyToMessage
          replyToMessage={replyToMessage}
          onCancelReply={() => setReplyToMessage(null)}
        />
      )}

      <div
        ref={containerRef}
        id="input-container"
        className="chatInput flex gap-2 items-end w-full transition-[height] duration-200 ease-in-out"
      >
        <textarea
          ref={inputRef}
          defaultValue=""
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          className={`w-full outline-none bg-transparent resize-none overflow-hidden ${
            isMessageSent
              ? "opacity-10 transition-opacity duration-100 ease-in-out"
              : ""
          }`}
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
                <AttachFile onFileSelect={handleFileSelect} />
              </motion.div>

              <button
                className={`rounded bg-[var(--primary-green)] border-2 border-green-400 flex items-center justify-center text-white transition-all duration-300 ${
                  shouldShowSendButton
                    ? "w-[30px] opacity-100 ml-0 pointer-events-auto"
                    : "w-0 opacity-0 -ml-2 pointer-events-none"
                }`}
                onClick={async () => {
                  await handleSendMessage({
                    chatId,
                    memberId,
                    inputRef,
                    attachments: attachedFiles,
                    replyToMessageId,
                    onSuccess: () => {
                      clearTypingState();
                      setDraftMessage(chatId, "");
                      setAttachedFiles([]);
                      setFilePreviewUrls([]);
                      setHasTextContent(false);
                      setIsMessageSent(true);
                      setReplyToMessage(null);
                      setTimeout(() => setIsMessageSent(false), 200);
                      updateInputHeight();
                    },
                  });
                  inputRef.current?.focus();
                }}
                aria-label="Send message"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatBar);
