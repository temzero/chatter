import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGlobalContext } from '@/contexts/GlobalContext';
import { useChat } from '@/contexts/ChatContext';
import CustomEmojiPicker from '../ui/CustomEmojiPicker';

const ChatBar: React.FC = () => {
  const { currentUser } = useGlobalContext();
  const { activeChat, addMessage } = useChat();
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }

      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
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
    if (trimmedInput && activeChat) {
      const newMessage = {
        id: Date.now(),
        chatId: activeChat.id,
        senderId: currentUser?.id || 'me',
        text: trimmedInput,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      addMessage(newMessage);
      setInput('');
      if (inputRef.current) inputRef.current.style.height = 'auto';
      if (containerRef.current) containerRef.current.style.height = 'auto';
      inputRef.current?.focus();
    }
    close();
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
  };

  function handleAttatchFileClick() {
    alert('Attaching')
  }

  return (
    <div className="backdrop-blur-[199px] w-full flex items-center p-4 justify-between shadow border-[var(--border-color)] z-40 relative">
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
                animate={{
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
                }}
                className="flex gap-2 items-center"
              >

                <CustomEmojiPicker onSelect={handleEmojiSelect} />

                <motion.a
                  className="material-symbols-outlined opacity-50 hover:opacity-90 cursor-pointer rounded select-none"
                  aria-label="Attach file"
                  onClick={handleAttatchFileClick}
                >
                  attach_file
                </motion.a>
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
  );
};

export default ChatBar;
