import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { motion } from 'framer-motion';

const ChatBar: React.FC = () => {
  const [input, setInput] = useState('');
  const { activeRoom, sendMessage } = useChat();
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      // Reset height to get the correct scrollHeight
      inputRef.current.style.height = 'auto';
      // Set the height based on the content, with a max of 100px
      const newHeight = Math.min(inputRef.current.scrollHeight, 100);
      inputRef.current.style.height = `${newHeight}px`;
      
      // Adjust the container height to match
      if (containerRef.current) {
        containerRef.current.style.height = `${newHeight + 13}px`;
      }
    }
  }, [input]);

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (trimmedInput && activeRoom) {

      sendMessage(trimmedInput);
      setInput('');
      
      // Reset heights after sending
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
      if (containerRef.current) {
        containerRef.current.style.height = 'auto';
      }
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

  return (
    <div className="absolute bottom-0 backdrop-blur-[199px] w-full flex items-center p-4 justify-between shadow border-[var(--border-color)] z-30">
      <div 
        id='input-container' 
        ref={containerRef}
        className="input gap-1 flex items-end w-full transition-[height] duration-200 ease-in-out"
      >
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full outline-none bg-transparent resize-none overflow-hidden py-2 border"
          placeholder="Type a message..."
          aria-label="Type your message"
          rows={1}
        />
        
        <div id='chat-buttons-container' className="flex items-center gap-2 h-[24px]">
          <motion.div
            animate={{ 
              transition: { type: 'spring', stiffness: 300, damping: 20 }
            }}
            className="flex gap-2 items-center"
          >
            <motion.a 
              className="material-symbols-outlined opacity-60 hover:opacity-90 cursor-pointer scale-x-[-1]"
              aria-label="Attach file"
            >
              sentiment_satisfied
            </motion.a>
            
            <motion.a 
              className="material-symbols-outlined opacity-60 hover:opacity-90 cursor-pointer"
              aria-label="Emoji picker"
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
              transition: { type: 'spring', stiffness: 300, damping: 20 }
            }}
            className="material-symbols-outlined cursor-pointer overflow-hidden"
            onClick={handleSend}
            aria-label="Send message"
          >
            send
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChatBar;