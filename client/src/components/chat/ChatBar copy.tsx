import React, { useRef, useEffect, useState, useCallback } from "react";
import { useActiveChat } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";
import { motion } from "framer-motion";
import EmojiPicker from "../ui/EmojiPicker";
import AttachFile from "../ui/AttachFile";
import FileImportPreviews from "../ui/FileImportPreview";
import { SendMessagePayload } from "@/types/sendMessagePayload";
import { chatWebSocketService } from "@/lib/websocket/services/chat.socket.service";
import useTypingIndicator from "@/hooks/useTypingIndicator";

const ChatBar: React.FC = () => {
  console.log("CHAT BAR mounted");
  const activeChat = useActiveChat();
  const activeChatId = activeChat?.id;

  const setDraftMessage = useMessageStore((state) => state.setDraftMessage);
  const getDraftMessage = useMessageStore((state) => state.getDraftMessage);
  const inputRef = useRef<HTMLTextAreaElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);
  const [hasTextContent, setHasTextContent] = useState(false);

  // Get current input value without state
  // const getInputValue = useCallback(() => inputRef.current?.value || "", []);
  // useTypingIndicator(inputRef, activeChatId ?? null);
  const { clearTypingState } = useTypingIndicator(
    inputRef,
    activeChatId ?? null
  );

  // Compute visibility based on content
  const shouldShowSendButton = hasTextContent || attachedFiles.length > 0;

  // Load draft message when chat changes
  useEffect(() => {
    if (activeChatId && inputRef.current) {
      const draft = getDraftMessage(activeChatId);
      inputRef.current.value = draft || "";
      setHasTextContent(!!draft?.trim());
      updateInputHeight();
    }
  }, [activeChatId, getDraftMessage]);

  // Save draft when unmounting
  useEffect(() => {
    return () => {
      if (activeChatId && inputRef.current?.value) {
        setDraftMessage(activeChatId, inputRef.current.value);
      }
    };
  }, [activeChatId, setDraftMessage]);

  // Focus management
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

  // Reset files when chat changes
  useEffect(() => {
    setAttachedFiles([]);
    setFilePreviewUrls([]);
  }, [activeChatId]);

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

  const handleSend = useCallback(async () => {
    const inputValue = inputRef.current?.value || "";
    const trimmedInput = inputValue.trim();

    if ((trimmedInput || attachedFiles.length > 0) && activeChatId) {
      if (inputRef.current) inputRef.current.value = "";

      const payload: SendMessagePayload = {
        chatId: activeChatId,
        content: trimmedInput || undefined,
        attachmentIds:
          attachedFiles.length > 0
            ? attachedFiles.map((_, index) => String(Date.now() + index))
            : undefined,
      };

      try {
        chatWebSocketService.sendMessage(payload);
        chatWebSocketService.messageRead(activeChatId);
      } catch (error) {
        console.error("Failed to send message:", error);
      }
      clearTypingState();
      setDraftMessage(activeChatId, "");
      setAttachedFiles([]);
      setFilePreviewUrls([]);
      setHasTextContent(false);
      setIsMessageSent(true);
      setTimeout(() => setIsMessageSent(false), 200);

      updateInputHeight();
    }
    inputRef.current?.focus();
  }, [activeChatId, attachedFiles, setDraftMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Escape") {
        if (inputRef.current) inputRef.current.value = "";
        if (activeChatId) setDraftMessage(activeChatId, "");
        setHasTextContent(false);
        updateInputHeight();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [activeChatId, handleSend, setDraftMessage]
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
    <div className="backdrop-blur-[199px] w-full flex flex-col items-center p-4 justify-between shadow border-[var(--border-color)] z-40 relative">
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
            activeChatId ? "Message..." : "Select a chat to start messaging"
          }
          aria-label="Message"
          rows={1}
          disabled={!activeChatId}
        />

        <div className="flex items-center justify-between gap-2 h-[24px]">
          {activeChatId && (
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
                onClick={handleSend}
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
