import React, { useRef, useEffect, useState, useMemo } from 'react';
import Message from './Message';
import ChannelMessage from './MessageChannel';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';

const ChatBox: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeChat, activeMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  
  // Track if a new message was added
  const newMessageAdded = useMemo(() => {
    return activeMessages.length > previousMessageCount;
  }, [activeMessages.length, previousMessageCount]);

  useEffect(() => {
    // Update previous count after checking for new messages
    setPreviousMessageCount(activeMessages.length);
  }, [activeMessages.length]);

  useEffect(() => {
    if (newMessageAdded) {
      messagesEndRef.current?.scrollIntoView();
    }
  }, [newMessageAdded, activeMessages]);

  const isChannel = activeChat?.type === 'channel';

  return (
    <div className="absolute z-0 flex-1 py-32 h-full w-full flex flex-col overflow-x-hidden overflow-y-auto p-6 backdrop-blur-sm">
      {activeMessages.length > 0 ? (
        activeMessages.map((msg, index) =>
          isChannel ? (
            <ChannelMessage
              key={msg.id}
              id={msg.id}
              time={msg.time}
              text={msg.text}
              media={msg.media}
              shouldAnimate={newMessageAdded && index === activeMessages.length - 1}
            />
          ) : (
            <Message
              key={msg.id}
              id={msg.id}
              isMe={msg.senderId === currentUser?.id}
              avatar={msg.avatar}
              senderName={msg.senderId}
              time={msg.time}
              text={msg.text}
              media={msg.media}
              shouldAnimate={newMessageAdded && index === activeMessages.length - 1}
            />
          )
        )
      ) : (
        <div className="h-full w-full flex items-center justify-center opacity-50 italic text-xl">No messages yet!</div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatBox;