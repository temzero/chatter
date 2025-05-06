import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from '../ui/EmojiPicker';
import AttachFile from '../ui/AttachFile';
import FileImportPreviews from '../ui/FileImportPreview';
import { useCurrentUser } from '@/stores/authStore';

const ChatBar: React.FC = () => {
  const currentUser = useCurrentUser()
  const { activeChat, addMessage, setDraftMessage, getDraftMessage } = useChat();
  const [input, setInput] = useState('');
  const [triggerSendAnimation, setTriggerSendAnimation] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);

  // Focus input on load and when '/' is pressed
  useEffect(() => {
    inputRef.current?.focus();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (activeChat) {
      const draft = getDraftMessage(activeChat.id);
      setInput(draft || '');
    }
  }, [activeChat]);
  
  useEffect(() => {
    // Only reset files when the chat changes
    setAttachedFiles([]);
    setFilePreviewUrls([]);
  }, [activeChat?.id]);
  

  // Adjust input height
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const newHeight = Math.min(inputRef.current.scrollHeight, 100);
      inputRef.current.style.height = `${newHeight}px`;

      if (containerRef.current) {
        containerRef.current.style.height = `${newHeight + 13}px`;
      }
    }
  }, [input]);

  const handleSend = () => {
    const trimmedInput = input.trim();
    if ((trimmedInput || attachedFiles.length > 0) && activeChat) {
      if (inputRef.current) {
        inputRef.current.value = ''; // <-- instantly clear textarea content
      }
      setInput('');
      const newMessage = {
        id: String(Date.now()),
        chatId: activeChat.id,
        senderId: currentUser?.id || 'me',
        text: trimmedInput,
        media: attachedFiles.map((file, index) => ({
          id: String(Date.now() + index),
          messageId: String(Date.now()),
          type: file.type.startsWith('image') ? 'image' :
                file.type.startsWith('video') ? 'video' :
                file.type.startsWith('audio') ? 'audio' : 'file',
          fileName: file.name,
          url: URL.createObjectURL(file),
          size: file.size,
        })),
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      addMessage(newMessage);
      setDraftMessage(activeChat.id, '');
      setAttachedFiles([]);
      setFilePreviewUrls([]);
      if (inputRef.current) inputRef.current.style.height = 'auto';
      if (containerRef.current) containerRef.current.style.height = 'auto';
    }
  
    setTriggerSendAnimation(prev => !prev);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };
  

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setInput('');
      if (activeChat) setDraftMessage(activeChat.id, '');
    } else if (e.key === 'Enter' && !e.shiftKey) {
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

      <div ref={containerRef} id="input-container" className="input gap-1 flex items-end overflow-hidden w-full transition-[height] duration-200 ease-in-out">
        
      <AnimatePresence mode="wait">
        <motion.div
          key={triggerSendAnimation}
          className="w-full flex items-center"
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (activeChat) setDraftMessage(activeChat.id, e.target.value);
            }}
            onKeyDown={handleKeyDown}
            className="w-full outline-none bg-transparent resize-none py-2 border"
            placeholder={
              activeChat ? "Message..." : "Select a chat to start messaging"
            }
            aria-label="Message"
            rows={1}
            disabled={!activeChat}
          />
        </motion.div>
      </AnimatePresence>

        {/* buttons */}
        <div className="flex items-center gap-2 h-[24px]">
          {activeChat && (
            <>
              <motion.div
                className="flex gap-2 items-center"
                animate={{
                  transition: {
                    type: 'spring',
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
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
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
