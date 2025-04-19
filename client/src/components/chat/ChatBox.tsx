import React, { useRef, useEffect, useState } from 'react';
import Message from './Message';
import ChannelMessage from './MessageChannel';
import { useGlobalContext } from '@/contexts/GlobalContext';
import { useChat } from '@/contexts/ChatContext';

const ChatBox: React.FC = () => {
  const { currentUser } = useGlobalContext();
  const { activeChat, activeMessages } = useChat();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isInitialLoad && activeMessages.length > 0) {
      // On initial load, scroll instantly without animation
      messagesEndRef.current?.scrollIntoView();
      setIsInitialLoad(false);
    } else if (!isInitialLoad) {
      // On subsequent updates, scroll smoothly
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages, isInitialLoad]);

  const isChannel = activeChat?.type === 'channel';

  return (
    <div className="flex-1 h-full flex flex-col overflow-y-auto p-6 backdrop-blur-sm">
      {activeMessages.length > 0 ? (
        activeMessages.map((msg) =>
          isChannel ? (
            <ChannelMessage
              key={msg.id}
              avatar={msg.avatar}
              senderName={msg.senderId}
              time={msg.time}
              text={msg.text}
            />
          ) : (
            <Message
              key={msg.id}
              isMe={msg.senderId === currentUser?.id}
              avatar={msg.avatar}
              senderName={msg.senderId}
              time={msg.time}
              text={msg.text}
            />
          )
        )
      ) : (
        <div className="text-xl text-center opacity-40 italic">No messages yet!</div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatBox;