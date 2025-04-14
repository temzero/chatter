import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'them';
  avatarUrl: string;
  name: string;
  time: string;
}

const ChatBar: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello!',
      sender: 'me',
      avatarUrl: '/avatars/me.jpg',
      name: 'Me',
      time: '10:00 AM',
    },
    {
      id: 2,
      text: 'Hi there!',
      sender: 'them',
      avatarUrl: '/avatars/them.jpg',
      name: 'John Doe',
      time: '10:01 AM',
    },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input on initial render
  useEffect(() => {
    inputRef.current?.focus();

    // Add global keydown listener for '/' shortcut
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' || e.key === 'Enter' && !input && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [input]);

  const handleSend = () => {
    const trimmedInput = input.trim();
    if (trimmedInput) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: trimmedInput,
        sender: 'me',
        avatarUrl: '/avatars/me.jpg',
        name: 'Me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, newMessage]);
      setInput('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setInput('');
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="absolute bottom-0 backdrop-blur-[199px] w-full flex items-center p-4 custom-border-t justify-between shadow border-[var(--border-color)] z-50">
      <div className="input gap-1 flex items-center w-full">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full outline-none bg-transparent"
          placeholder="Press Enter or / to focus"
          aria-label="Type your message"
        />
        <div className="flex gap-2">
          <a 
            className="material-symbols-outlined opacity-50 hover:opacity-90 rotate-45 cursor-pointer"
            aria-label="Attach file"
          >
            attach_file
          </a>
          <a 
            className="material-symbols-outlined opacity-50 hover:opacity-90 cursor-pointer"
            aria-label="Use microphone"
          >
            mic
          </a>
          <a 
            className="material-symbols-outlined opacity-50 hover:opacity-90 cursor-pointer"
            onClick={handleSend}
            aria-label="Send message"
          >
            send
          </a>
        </div>
      </div>
    </div>
  );
};

export default ChatBar;