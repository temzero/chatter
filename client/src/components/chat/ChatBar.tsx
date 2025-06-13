import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";
import { motion } from "framer-motion";
import EmojiPicker from "../ui/EmojiPicker";
import AttachFile from "../ui/AttachFile";
import FileImportPreviews from "../ui/FileImportPreview";
import { SendMessagePayload } from "@/types/sendMessagePayload";
import { chatWebSocketService } from "@/lib/websocket/services/chat.socket.service";
import useTypingIndicator from "@/hooks/useTypingIndicator";

const ChatBar: React.FC = () => {
  const activeChat = useChatStore((state) => state.activeChat);
  const setDraftMessage = useMessageStore((state) => state.setDraftMessage);
  const getDraftMessage = useMessageStore((state) => state.getDraftMessage);

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMessageSent, setIsMessageSent] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);

  // Use the typing indicator hook
  useTypingIndicator({ input, activeChat });

  // Focus input on load and when '/' is pressed
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

  // Load draft message when chat changes
  useEffect(() => {
    if (activeChat) {
      const draft = getDraftMessage(activeChat.id);
      setInput(draft || "");
    }
  }, [activeChat, getDraftMessage]);

  // Reset files when chat changes
  useEffect(() => {
    setAttachedFiles([]);
    setFilePreviewUrls([]);
  }, [activeChat?.id]);

  // Adjust input height
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const newHeight = Math.min(inputRef.current.scrollHeight, 100);
      inputRef.current.style.height = `${newHeight}px`;

      if (containerRef.current) {
        containerRef.current.style.height = `${newHeight + 14}px`;
      }
    }
  }, [input]);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if ((trimmedInput || attachedFiles.length > 0) && activeChat) {
      setInput("");

      // Create the payload
      const payload: SendMessagePayload = {
        chatId: activeChat.id,
        content: trimmedInput || undefined,
        attachmentIds:
          attachedFiles.length > 0
            ? attachedFiles.map((_, index) => String(Date.now() + index))
            : undefined,
      };

      try {
        // Send via WebSocket
        chatWebSocketService.sendMessage(payload);

        // Mark as read
        chatWebSocketService.markAsRead(activeChat.id);
      } catch (error) {
        console.error("Failed to send message:", error);
      }

      // Clear local state
      setDraftMessage(activeChat.id, "");
      setAttachedFiles([]);
      setFilePreviewUrls([]);
      setIsMessageSent(true);
      setTimeout(() => setIsMessageSent(false), 200);

      if (inputRef.current) inputRef.current.style.height = "auto";
      if (containerRef.current) containerRef.current.style.height = "auto";
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setInput("");
      if (activeChat) setDraftMessage(activeChat.id, "");
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  function handleEmojiSelect(emoji: string) {
    setInput((prev) => {
      const updated = prev + emoji;
      if (activeChat) setDraftMessage(activeChat.id, updated);
      return updated;
    });
    inputRef.current?.focus();
  }

  function handleFileSelect(fileList: FileList) {
    const newFiles = Array.from(fileList);
    if (newFiles.length === 0) return;

    const newPreviews: string[] = [];
    let loadedCount = 0;

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        loadedCount++;
        if (loadedCount === newFiles.length) {
          setAttachedFiles((prev) => [...prev, ...newFiles]);
          setFilePreviewUrls((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

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
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (activeChat) setDraftMessage(activeChat.id, e.target.value);
          }}
          onKeyDown={handleKeyDown}
          className={`w-full outline-none bg-transparent resize-none overflow-hidden ${
            isMessageSent
              ? "opacity-10 transition-opacity duration-100 ease-in-out"
              : ""
          }`}
          placeholder={
            activeChat ? "Message..." : "Select a chat to start messaging"
          }
          aria-label="Message"
          rows={1}
          disabled={!activeChat}
        />

        {/* buttons */}
        <div className="flex items-center justify-between gap-2 h-[24px]">
          {activeChat && (
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
                <AttachFile
                  onFileSelect={(files) => {
                    if (files) handleFileSelect(files);
                  }}
                />
              </motion.div>

              <motion.button
                initial={false}
                animate={{
                  width: input || attachedFiles.length ? 30 : 0,
                  opacity: input || attachedFiles.length ? 1 : 0,
                  marginLeft: input || attachedFiles.length ? 0 : -8,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                className="rounded bg-[var(--primary-green)] border-2 border-green-400 flex items-center justify-center text-white hover:border-3"
                onClick={handleSend}
                aria-label="Send message"
              >
                <span className="material-symbols-outlined ">send</span>
              </motion.button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBar;