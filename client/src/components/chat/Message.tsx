import React from 'react';
import classNames from 'classnames';
import { useChat } from '@/contexts/ChatContext';
import RenderMultipleMedia from '../ui/RenderMultipleMedia';
import type { MediaProps } from '@/data/media';

type RenderMessageProps = {
  isMe?: boolean;
  avatar?: string;
  senderName: string;
  time: string;
  text: string;
  media?: MediaProps[];
};

const Message: React.FC<RenderMessageProps> = ({ isMe = false, avatar, senderName, time, text, media = null }) => {
  const { activeChat } = useChat();
  const isGroupChat = activeChat?.type === 'group';
  const alignmentClass = (isMe: boolean) => ({
    'ml-auto': isMe,
    'mr-auto': !isMe,
  });

  const iconAlignmentClass = (isMe: boolean) => ({
    'absolute -bottom-1 -left-2 flex-row-reverse': isMe,
    'absolute -bottom-1 -right-2': !isMe,
  });
  

  return (
    <div className={classNames('flex gap-2 max-w-[60%] mb-4 group', alignmentClass(isMe))}>

      {/* Avatar - only shown for group chats */}
      {isGroupChat && !isMe && (
        <div className="mt-auto h-10 w-10 min-w-10 min-h-10 flex items-center justify-center rounded-full object-cover custom-border overflow-hidden">
          {avatar ? (
            <img src={avatar} className="h-full w-full object-cover"/>
          ) : (
            <i className="material-symbols-outlined text-4xl opacity-20">mood</i>
          )}
        </div>
      )}

      <div className="flex relative flex-col">
          {media && media.length > 0 ? (
            <div className={classNames('message-media-bubble', {'self-message ml-auto': isMe})}>
              <RenderMultipleMedia media={media} />
              {text && <h1 className='p-2'>{text}</h1>}
            </div>
          ) : (
            <div className={classNames('message-bubble', {'self-message ml-auto': isMe})}>
              {text}
            </div>
          )}

          <div className={classNames("flex items-end h-5",alignmentClass(isMe))}>
            {isGroupChat && !isMe && 
              <h1 className={classNames('text-sm font-semibold opacity-70 mr-2')}>
                {senderName}
              </h1>
            }
              <p className={classNames('opacity-0 group-hover:opacity-40 text-xs')}>{time}</p>
          </div>
          
          <div
            className={classNames('flex gap-1 opacity-0 group-hover:opacity-80 transition-opacity duration-200 cursor-pointer z-20',
              iconAlignmentClass(isMe)
            )}>
            <i className="material-symbols-outlined hover:scale-125 opacity-80 hover:opacity-100 duration-200" onClick={() => alert('Deleting')}>delete</i>
            <i className="material-symbols-outlined hover:scale-125 opacity-80 hover:opacity-100 duration-200" onClick={() => alert('Pinned')}>keep</i>
            <i className="material-symbols-outlined hover:scale-125 opacity-80 hover:opacity-100 duration-200" onClick={() => alert('Forwarding')}>send</i>
            <i className="material-symbols-outlined hover:scale-125 opacity-80 hover:opacity-100 duration-200 rotate-180 " onClick={() => alert('Replying')}>reply</i>
            <i className="material-symbols-outlined hover:scale-125 opacity-80 hover:opacity-100 duration-200" onClick={() => alert('Liked')}>favorite</i>
          </div>
      </div>
    </div>
  );
};

export default Message;