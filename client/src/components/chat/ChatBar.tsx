// import React, { useState, useRef, useEffect } from "react";
// import { useChatStore } from "@/stores/chatStore";
// import { useMessageStore } from "@/stores/messageStore";
// import { motion } from "framer-motion";
// import EmojiPicker from "../ui/EmojiPicker";
// import AttachFile from "../ui/AttachFile";
// import FileImportPreviews from "../ui/FileImportPreview";
// import { SendMessagePayload } from "@/types/sendMessagePayload";
// import { chatWebSocketService } from "@/lib/websocket/services/chat.socket.service";

// const ChatBar: React.FC = () => {
//   const activeChat = useChatStore((state) => state.activeChat);
//   const setDraftMessage = useMessageStore((state) => state.setDraftMessage);
//   const getDraftMessage = useMessageStore((state) => state.getDraftMessage);

//   const [input, setInput] = useState("");
//   const inputRef = useRef<HTMLTextAreaElement>(null);
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [isMessageSent, setIsMessageSent] = useState(false);
//   const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
//   const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);

//   const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

//   // Handle typing indicator
//   useEffect(() => {
//     if (!activeChat?.id) return;

//     const handleInputChange = () => {
//       // Send typing start event
//       chatWebSocketService.typing(activeChat.id, true);

//       // Clear any existing timeout
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }

//       // Set timeout to send typing stop event after 2 seconds of inactivity
//       typingTimeoutRef.current = setTimeout(() => {
//         chatWebSocketService.typing(activeChat.id, false);
//       }, 2000);
//     };

//     const inputElem = inputRef.current;
//     if (inputElem) {
//       inputElem.addEventListener("input", handleInputChange);
//     }

//     return () => {
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//       if (inputElem) {
//         inputElem.removeEventListener("input", handleInputChange);
//       }
//     };
//   }, [activeChat?.id]);

//   // Focus input on load and when '/' is pressed
//   useEffect(() => {
//     inputRef.current?.focus();

//     const handleGlobalKeyDown = (e: KeyboardEvent) => {
//       if (e.key === "/" && document.activeElement !== inputRef.current) {
//         e.preventDefault();
//         inputRef.current?.focus();
//       }
//     };

//     document.addEventListener("keydown", handleGlobalKeyDown);
//     return () => document.removeEventListener("keydown", handleGlobalKeyDown);
//   }, []);

//   useEffect(() => {
//     if (activeChat) {
//       const draft = getDraftMessage(activeChat.id);
//       setInput(draft || "");
//     }
//   }, [activeChat, getDraftMessage]);

//   useEffect(() => {
//     // Only reset files when the chat changes
//     setAttachedFiles([]);
//     setFilePreviewUrls([]);
//   }, [activeChat?.id]);

//   // Adjust input height
//   useEffect(() => {
//     if (inputRef.current) {
//       inputRef.current.style.height = "auto";
//       const newHeight = Math.min(inputRef.current.scrollHeight, 100);
//       inputRef.current.style.height = `${newHeight}px`;

//       if (containerRef.current) {
//         containerRef.current.style.height = `${newHeight + 14}px`;
//       }
//     }
//   }, [input]);

//   // const handleSend = async () => {
//   //   const trimmedInput = input.trim();
//   //   if ((trimmedInput || attachedFiles.length > 0) && activeChat) {
//   //     setInput("");

//   //     // Create the payload according to SendMessagePayload interface
//   //     const payload: SendMessagePayload = {
//   //       chatId: activeChat.id,
//   //       content: trimmedInput || undefined,
//   //       attachmentIds:
//   //         attachedFiles.length > 0
//   //           ? attachedFiles.map((_, index) => String(Date.now() + index))
//   //           : undefined,
//   //     };

//   //     await messageService.sendMessage(payload);

//   //     // Clear local state
//   //     setDraftMessage(activeChat.id, "");
//   //     setAttachedFiles([]);
//   //     setFilePreviewUrls([]);
//   //     setIsMessageSent(true);
//   //     setTimeout(() => setIsMessageSent(false), 200);

//   //     if (inputRef.current) inputRef.current.style.height = "auto";
//   //     if (containerRef.current) containerRef.current.style.height = "auto";
//   //   }
//   //   inputRef.current?.focus();
//   // };

//   const handleSend = async () => {
//     const trimmedInput = input.trim();
//     if ((trimmedInput || attachedFiles.length > 0) && activeChat) {
//       setInput("");

//       // Create the payload
//       const payload: SendMessagePayload = {
//         chatId: activeChat.id,
//         content: trimmedInput || undefined,
//         attachmentIds:
//           attachedFiles.length > 0
//             ? attachedFiles.map((_, index) => String(Date.now() + index))
//             : undefined,
//       };

//       try {
//         // Then send via WebSocket for real-time delivery
//         chatWebSocketService.sendMessage(payload);

//         // Mark as read
//         chatWebSocketService.markAsRead(activeChat.id);

//         // Clear typing indicator
//         chatWebSocketService.typing(activeChat.id, false);
//       } catch (error) {
//         console.error("Failed to send message:", error);
//       }

//       // Clear local state
//       setDraftMessage(activeChat.id, "");
//       setAttachedFiles([]);
//       setFilePreviewUrls([]);
//       setIsMessageSent(true);
//       setTimeout(() => setIsMessageSent(false), 200);

//       if (inputRef.current) inputRef.current.style.height = "auto";
//       if (containerRef.current) containerRef.current.style.height = "auto";
//     }
//     inputRef.current?.focus();
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === "Escape") {
//       setInput("");
//       if (activeChat) setDraftMessage(activeChat.id, "");
//     } else if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSend();
//     }
//   };

//   function handleEmojiSelect(emoji: string) {
//     setInput((prev) => {
//       const updated = prev + emoji;
//       if (activeChat) setDraftMessage(activeChat.id, updated);
//       return updated;
//     });
//     inputRef.current?.focus();
//   }

//   function handleFileSelect(fileList: FileList) {
//     const newFiles = Array.from(fileList);

//     if (newFiles.length === 0) return;

//     const newPreviews: string[] = [];
//     let loadedCount = 0;

//     newFiles.forEach((file) => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         newPreviews.push(reader.result as string);
//         loadedCount++;
//         if (loadedCount === newFiles.length) {
//           setAttachedFiles((prev) => [...prev, ...newFiles]);
//           setFilePreviewUrls((prev) => [...prev, ...newPreviews]);
//         }
//       };
//       reader.readAsDataURL(file);
//     });
//   }

//   return (
//     <div className="backdrop-blur-[199px] w-full flex flex-col items-center p-4 justify-between shadow border-[var(--border-color)] z-40 relative">
//       {filePreviewUrls.length > 0 && (
//         <FileImportPreviews
//           files={attachedFiles}
//           urls={filePreviewUrls}
//           onRemove={(index) => {
//             setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
//             setFilePreviewUrls((prev) => prev.filter((_, i) => i !== index));
//           }}
//         />
//       )}

//       <div
//         ref={containerRef}
//         id="input-container"
//         className="input gap-1 flex items-end w-full transition-[height] duration-200 ease-in-out"
//       >
//         <textarea
//           ref={inputRef}
//           value={input}
//           onChange={(e) => {
//             setInput(e.target.value);
//             if (activeChat) setDraftMessage(activeChat.id, e.target.value);
//           }}
//           onKeyDown={handleKeyDown}
//           className={`w-full outline-none bg-transparent resize-none overflow-hidden border ${
//             isMessageSent
//               ? "opacity-10 transition-opacity duration-100 ease-in-out"
//               : ""
//           }`}
//           placeholder={
//             activeChat ? "Message..." : "Select a chat to start messaging"
//           }
//           aria-label="Message"
//           rows={1}
//           disabled={!activeChat}
//         />

//         {/* buttons */}
//         <div className="flex items-center gap-2 h-[24px]">
//           {activeChat && (
//             <>
//               <motion.div
//                 className="flex gap-2 items-center"
//                 animate={{
//                   transition: {
//                     type: "spring",
//                     stiffness: 300,
//                     damping: 20,
//                   },
//                 }}
//               >
//                 <EmojiPicker onSelect={handleEmojiSelect} />
//                 <AttachFile
//                   onFileSelect={(files) => {
//                     if (files) handleFileSelect(files);
//                   }}
//                 />
//               </motion.div>

//               <motion.div
//                 initial={false}
//                 animate={{
//                   width: input || attachedFiles.length ? 24 : 0,
//                   opacity: input || attachedFiles.length ? 1 : 0,
//                   marginLeft: input || attachedFiles.length ? 0 : -8,
//                   transition: { type: "spring", stiffness: 300, damping: 20 },
//                 }}
//                 className="material-symbols-outlined cursor-pointer rounded"
//                 onClick={handleSend}
//                 aria-label="Send message"
//               >
//                 send
//               </motion.div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatBar;

import React, { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/stores/chatStore";
import { useMessageStore } from "@/stores/messageStore";
import { motion } from "framer-motion";
import EmojiPicker from "../ui/EmojiPicker";
import AttachFile from "../ui/AttachFile";
import FileImportPreviews from "../ui/FileImportPreview";
import { SendMessagePayload } from "@/types/sendMessagePayload";
import { chatWebSocketService } from "@/lib/websocket/services/chat.socket.service";

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
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle typing indicator
  const handleTypingIndicator = (isUserTyping: boolean) => {
    if (!activeChat?.id) return;

    // Clear any existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Only send event if state is changing
    if (isUserTyping !== isTyping) {
      chatWebSocketService.typing(activeChat.id, isUserTyping);
      setIsTyping(isUserTyping);
    }

    // If user is typing, set timeout to stop typing indicator
    if (isUserTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        chatWebSocketService.typing(activeChat.id, false);
        setIsTyping(false);
      }, 2000);
    }
  };

  // Update typing indicator when input changes
  useEffect(() => {
    if (input.trim().length > 0) {
      handleTypingIndicator(true);
    } else {
      handleTypingIndicator(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  // Clean up on unmount or chat change
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Send typing stop when component unmounts
      if (isTyping && activeChat?.id) {
        chatWebSocketService.typing(activeChat.id, false);
      }
    };
  }, [activeChat?.id, isTyping]);

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

        // Clear typing indicator
        handleTypingIndicator(false);
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
      handleTypingIndicator(false);
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
    handleTypingIndicator(true);
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
        className="input gap-1 flex items-end w-full transition-[height] duration-200 ease-in-out"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (activeChat) setDraftMessage(activeChat.id, e.target.value);
          }}
          onKeyDown={handleKeyDown}
          className={`w-full outline-none bg-transparent resize-none overflow-hidden border ${
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
        <div className="flex items-center gap-2 h-[24px]">
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

              <motion.div
                initial={false}
                animate={{
                  width: input || attachedFiles.length ? 24 : 0,
                  opacity: input || attachedFiles.length ? 1 : 0,
                  marginLeft: input || attachedFiles.length ? 0 : -8,
                  transition: { type: "spring", stiffness: 300, damping: 20 },
                }}
                className="material-symbols-outlined cursor-pointer rounded"
                onClick={handleSend}
                aria-label="Send message"
              >
                send
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBar;