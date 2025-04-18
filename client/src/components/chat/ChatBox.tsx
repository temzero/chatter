import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import Message from './Message';

const ChatBox: React.FC = () => {
  const { activeRoom, activeRoomMessages, currentUser } = useChat();

  // If there's no active room selected
  if (!activeRoom) {
    return (
      <div className="flex-1 flex items-center justify-center backdrop-blur-sm">
        <h1 className="text-gray-500 opacity-80">Select a chat to start messaging</h1>
      </div>
    );
  }

  // If there are no messages in the active room
  if (activeRoomMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center backdrop-blur-sm">
        <h1 className="text-gray-500 opacity-80">No messages yet!</h1>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 backdrop-blur-sm">
      {activeRoomMessages.map((msg) => {
        const isMe = msg.senderId === currentUser.id;
        const sender = isMe ? currentUser : getUserById(msg.senderId);
        
        return (
          <Message
            key={msg.id} // Important for React reconciliation
            id={msg.id}
            senderName={sender?.firstName || sender?.username || 'Unknown'}
            avatar={sender?.avatar}
            timestamp={msg.timestamp}
            content={msg.content}
            mediaIds={msg.mediaIds}
            isMe={isMe}
            isGroup={activeRoom.type !== 'private'}
            edited={msg.edited}
            deleted={msg.deleted}
            replyToId={msg.replyToId}
            reactions={msg.reactions}
          />
        );
      })}
    </div>
  );
};

export default ChatBox;