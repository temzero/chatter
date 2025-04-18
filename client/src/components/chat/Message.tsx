import React from 'react';
import classNames from 'classnames';

export interface MessageProps {
  id: string; // Changed from number to string to match your data structure
  senderName: string;
  content: string;
  timestamp: Date; // Changed from string to Date for better type safety
  isMe: boolean;
  isGroup?: boolean;
  avatar?: string; // Added missing prop
  edited?: boolean; // Added new prop
  deleted?: boolean; // Added new prop
  media?: string[]; // Added new prop for media attachments
  reactions?: Record<string, string[]>; // Added new prop for reactions
}

const Message: React.FC<MessageProps> = ({
  id,
  isMe = false,
  isGroup = false,
  senderName,
  timestamp,
  content,
  avatar,
  edited = false,
  deleted = false,
  media = [],
  reactions = {}
}) => {
  // Format timestamp to readable time
  const formattedTime = timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Handle deleted messages
  const displayContent = deleted ? 'This message was deleted' : content;
  const displayClassName = deleted ? 'italic opacity-70' : '';

  return (
    <div 
      className={classNames('flex max-w-[60%] group mb-4', {
        'ml-auto flex-row-reverse': isMe,
        'mr-auto': !isMe,
      })}
      data-message-id={id}
    >
      {/* Avatar (only shown in groups for others' messages) */}
      {isGroup && !isMe && (
        <div className="mt-auto h-10 w-10 min-w-10 min-h-10 flex items-center justify-center rounded-full custom-border overflow-hidden mr-2">
          {avatar ? (
            <img 
              src={avatar} 
              alt={senderName}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <i className="material-symbols-outlined text-2xl opacity-40">account_circle</i>
          )}
        </div>
      )}

      <div className={classNames('flex flex-col', {
        'items-end': isMe,
        'items-start': !isMe,
      })}>
        {/* Sender name (only shown in groups for others' messages) */}
        {isGroup && !isMe && (
          <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
            {senderName}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={classNames(
            'relative px-4 py-2 rounded-2xl break-words',
            displayClassName,
            {
              'bg-blue-500 text-white': isMe && !deleted,
              'bg-gray-200 dark:bg-gray-700': !isMe && !deleted,
              'bg-transparent border border-dashed': deleted,
            }
          )}
        >
          {displayContent}
          
          {/* Message status indicators */}
          <div className="absolute bottom-1 right-1 flex items-center gap-1">
            {edited && !deleted && (
              <span className="text-xs opacity-50">edited</span>
            )}
            <span className="text-xs opacity-50">
              {formattedTime}
            </span>
          </div>

          {/* Reaction button (always shown on hover) */}
          <button
            className={classNames(
              'absolute opacity-0 group-hover:opacity-80 transition-opacity duration-200',
              'material-symbols-outlined text-sm',
              {
                '-bottom-5 left-0': isMe,
                '-bottom-5 right-0': !isMe,
              }
            )}
            aria-label="Add reaction"
          >
            add_reaction
          </button>
        </div>

        {/* Reactions display */}
        {Object.keys(reactions).length > 0 && (
          <div className={classNames('flex gap-1 mt-1', {
            'justify-end': isMe,
            'justify-start': !isMe,
          })}>
            {Object.entries(reactions).map(([emoji, users]) => (
              <span 
                key={emoji} 
                className="text-xs bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1"
              >
                {emoji} {users.length}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;