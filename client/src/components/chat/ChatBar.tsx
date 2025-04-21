import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGlobalContext } from '@/contexts/GlobalContext';
import { useChat } from '@/contexts/ChatContext';
import EmojiPicker from '../ui/EmojiPicker';
import AttachFile from '../ui/AttatchFile';

const ChatBar: React.FC = () => {
  const { currentUser } = useGlobalContext();
  const { activeChat, addMessage } = useChat();
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

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
    if ((trimmedInput || attachedImages.length > 0) && activeChat) {
      const newMessage = {
        id: Date.now(),
        chatId: activeChat.id,
        senderId: currentUser?.id || 'me',
        text: trimmedInput,
        images: imagePreviewUrls,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      addMessage(newMessage);
      setInput('');
      setAttachedImages([]);
      setImagePreviewUrls([]);

      if (inputRef.current) inputRef.current.style.height = 'auto';
      if (containerRef.current) containerRef.current.style.height = 'auto';
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setInput('');
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  function handleEmojiSelect(emoji: string) {
    setInput((prev) => prev + emoji);
    inputRef.current?.focus();
  }

  function handleFileSelect(fileList: FileList) {
    const newFiles = Array.from(fileList).filter((file) =>
      file.type.startsWith('image/')
    );

    if (newFiles.length === 0) return;

    const newPreviews: string[] = [];
    let loadedCount = 0;

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        loadedCount++;
        if (loadedCount === newFiles.length) {
          setAttachedImages((prev) => [...prev, ...newFiles]);
          setImagePreviewUrls((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  return (
    <>


      <div className="backdrop-blur-[199px] w-full flex flex-col items-center p-4 justify-between shadow border-[var(--border-color)] z-40 relative">
        <div className="flex gap-2 mb-2 w-full flex-wrap">
          {imagePreviewUrls.map((url, index) => (
            <div key={index} className="relative w-[80px] h-[80px] group">
              <img
                src={url}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover rounded"
              />
              <button
                onClick={() => {
                  setAttachedImages((prev) =>
                    prev.filter((_, i) => i !== index)
                  );
                  setImagePreviewUrls((prev) =>
                    prev.filter((_, i) => i !== index)
                  );
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-3xl rounded opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div
          id="input-container"
          ref={containerRef}
          className="input gap-1 flex items-end w-full transition-[height] duration-200 ease-in-out"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full outline-none bg-transparent resize-none py-2 border"
            placeholder={
              activeChat
                ? 'Type your message...'
                : 'Select a chat to start messaging'
            }
            aria-label="Type your message"
            rows={1}
            disabled={!activeChat}
          />

          <div
            id="chat-buttons-container"
            className="flex items-center gap-2 h-[24px]"
          >
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
                    width: input ? 24 : 0,
                    opacity: input ? 1 : 0,
                    marginLeft: input ? 0 : -8,
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
    </>
  );
};

export default ChatBar;
