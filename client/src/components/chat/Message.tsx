import React from 'react';
import classNames from 'classnames';
import { useChat } from '@/contexts/ChatContext';
import RenderMedia from '../ui/RenderMedia';
import type { MediaProps } from '@/data/media';

type MessageProps = {
  isMe?: boolean;
  avatar?: string;
  senderName: string;
  time: string;
  text: string;
  media?: MediaProps;
};

const Message: React.FC<MessageProps> = ({ isMe = false, avatar, senderName, time, text, media = null }) => {
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

      <div className="flex relative flex-col gap-1">
        {/* Sender name - only shown for group chats */}
        {isGroupChat && (
          <div className={classNames('text-sm font-semibold opacity-60 mb-1', {
            'text-left': isMe,
            'text-right': !isMe,
          })}>
            {senderName}
          </div>
        )}

        {media ? (
          <div
            className={classNames('message-media-bubble', {
              'self-message': isMe,
            })}
          >
            <RenderMedia media={media} />
            {text && <h1 className='p-2 max-w-[var(--media-width)]'>{text}</h1>}
            
          </div>
        ) : (
          <div
            className={classNames('message-bubble', {
              'self-message ml-auto': isMe,
            })}
          >
            {text}
          </div>
        )}

        <i
          className={classNames(
            'material-symbols-outlined absolute opacity-0 group-hover:opacity-80 transition-opacity duration-200 cursor-pointer z-20',
            {
              '-bottom-1 left-0': isMe,
              '-bottom-1 right-0': !isMe,
            }
          )}
          onClick={() => alert('Liked')}
        >
          favorite
        </i>

        <div className="text-xs opacity-0 group-hover:opacity-40">{time}</div>
      </div>
    </div>
  );
};

export default Message;