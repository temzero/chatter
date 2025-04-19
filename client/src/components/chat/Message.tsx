import React from 'react';
import classNames from 'classnames';
import { useChat } from '@/contexts/ChatContext';

type MessageProps = {
  isMe?: boolean;
  avatar?: string;
  senderName: string;
  time: string;
  text: string;
};

const Message: React.FC<MessageProps> = ({ isMe = false, avatar, senderName, time, text }) => {
  const { activeChat } = useChat();
  const isGroupChat = activeChat?.type === 'group';

  return (
    <div className={classNames('flex justify-start max-w-[60%] mb-1 group', {
      'flex-row-reverse text-right ml-auto': isMe,
      'flex-row text-left mr-auto': !isMe,
    })}>
      {/* Avatar - only shown for group chats */}
      {isGroupChat && (
        <div className="mt-auto h-10 w-10 min-w-10 min-h-10 flex items-center justify-center rounded-full object-cover custom-border overflow-hidden">
          {avatar ? (
            <img
              src={avatar}
              alt={`${senderName}'s avatar`}
              className="h-full w-full object-cover"
            />
          ) : (
            <i className="material-symbols-outlined text-2xl opacity-20">mood</i>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1">
        {/* Sender name - only shown for group chats */}
        {isGroupChat && (
          <div className={classNames('text-sm font-semibold opacity-60 mb-1', {
            'text-right': isMe,
            'text-left': !isMe,
          })}>
            {senderName}
          </div>
        )}

        <div
          className={classNames('', {
            'message-bubble self-message ml-auto': isMe,
            'message-bubble': !isMe,
          })}
        >
          {text}
          <i
            className={classNames(
              'material-symbols-outlined absolute opacity-0 group-hover:opacity-80 transition-opacity duration-200 cursor-pointer',
              {
                '-bottom-6 left-0': isMe,
                '-bottom-6 right-0': !isMe,
              }
            )}
          >
            favorite
          </i>
        </div>

        <div className="text-xs opacity-0 group-hover:opacity-40">{time}</div>
      </div>
    </div>
  );
};

export default Message;