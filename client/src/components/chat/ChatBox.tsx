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
    <div className="absolute z-0 flex-1 py-32 h-full w-full flex flex-col overflow-x-hidden overflow-y-auto p-6 backdrop-blur-sm">
      {activeMessages.length > 0 ? (
        activeMessages.map((msg) =>
          isChannel ? (
            <ChannelMessage
              key={msg.id}
              avatar={msg.avatar}
              senderName={msg.senderId}
              time={msg.time}
              text={msg.text}
              media={msg.media}  // Pass media prop to ChannelMessage
            />
          ) : (
            <Message
              key={msg.id}
              isMe={msg.senderId === currentUser?.id}
              avatar={msg.avatar}
              senderName={msg.senderId}
              time={msg.time}
              text={msg.text}
              media={msg.media}  // Pass media prop to Message
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