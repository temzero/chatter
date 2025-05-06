import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { useChatStore } from '@/stores/chatStore';
import RenderMultipleMedia from '../ui/RenderMultipleMedia';
import type { MediaProps } from '@/data/media';
import FormatTime from '@/utils/formatTime';

type RenderMessageProps = {
  id: string;
  isMe?: boolean;
  avatar?: string;
  senderName: string;
  time: string;
  text?: string;
  media?: MediaProps[];
  shouldAnimate?: boolean;
};

// Animation configurations
const myMessageAnimation = {
  initial: { opacity: 0, scale: 0.1, x: -1000, y: 160 },
  animate: { opacity: 1, scale: 1, x: 0, y: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 29 }
};

const otherMessageAnimation = {
  initial: { opacity: 0, scale: 0.1, x: -200, y: 30 },
  animate: { opacity: 1, scale: 1, x: 0, y: 0 },
  transition: { type: 'spring', stiffness: 222, damping: 20 }
};

const noAnimation = {
  initial: false,
  animate: false,
  transition: {}
};

const Message: React.FC<RenderMessageProps> = ({ 
  id, 
  isMe = false, 
  avatar, 
  senderName, 
  time, 
  text, 
  media = null,
  shouldAnimate = false 
}) => {
  const activeChat = useChatStore((state) => state.activeChat);
  const deleteMessage = useChatStore((state) => state.deleteMessage);

  const [copied, setCopied] = useState(false);

  const isGroupChat = activeChat?.type === 'group';

  const alignmentClass = (isMe: boolean) => ({
    'ml-auto': isMe,
    'mr-auto': !isMe,
  });

  const iconAlignmentClass = (isMe: boolean) => ({
    'absolute -bottom-1 -left-2 flex-row-reverse': isMe,
    'absolute -bottom-1 -right-2': !isMe,
  });

  // Handle copy text
  const handleCopyText = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (copied) {
      timer = setTimeout(() => setCopied(false), 200);
    }
    return () => clearTimeout(timer);
  }, [copied]);

  // Determine animation
  const animationProps = shouldAnimate 
    ? (isMe ? myMessageAnimation : otherMessageAnimation)
    : noAnimation;

  return (
    <motion.div
      className={classNames('flex max-w-[60%] mb-1 group', alignmentClass(isMe))}
      initial={animationProps.initial}
      animate={animationProps.animate}
      transition={animationProps.transition}
    >
      {/* Sender Avatar */}
      {isGroupChat && !isMe && (
        <div className="mt-auto mr-1 h-10 w-10 min-w-10 min-h-10 flex items-center justify-center rounded-full object-cover custom-border overflow-hidden">
          {avatar ? (
            <img src={avatar} className="h-full w-full object-cover" />
          ) : (
            <i className="material-symbols-outlined text-4xl">mood</i>
          )}
        </div>
      )}

      <div className="flex relative flex-col">
        {/* Media and Text */}
        {media && media.length > 0 ? (
          <div className={classNames('message-media-bubble', { 'self-message ml-auto': isMe })}
            style={{
              width: media.length === 1 ? 'var(--media-width)' : 'var(--media-width-large)',
            }}
          >
            <RenderMultipleMedia media={media} />
            {text && (
              <h1
                className={`p-2 break-words max-w-full cursor-pointer transition-all duration-200
                  ${copied ? "scale-110 opacity-60" : ''}
                `}
                onClick={handleCopyText}
              >
                {text}
              </h1>
            )}
          </div>
        ) : (
          <div className={classNames('message-bubble cursor-pointer transition-all duration-200', { 'self-message ml-auto': isMe }, {'scale-110': copied})}>
            <h1
                className={`break-words max-w-full cursor-pointer transition-all duration-200
                  ${copied ? "scale-110 opacity-60" : ''}
                `}
                onClick={handleCopyText}
              >
                {text}
              </h1>
          </div>
        )}

        {/* Sender Info */}
        <div className={classNames('flex items-end h-5', alignmentClass(isMe))}>
          {isGroupChat && !isMe && (
            <h1 className="text-sm font-semibold opacity-70 mr-2">
              {senderName}
            </h1>
          )}
          <p className="opacity-0 group-hover:opacity-40 text-xs"><FormatTime time={time} /></p>

        </div>

        {/* Action Buttons */}
        <div
          className={classNames(
            'flex gap-1 opacity-0 group-hover:opacity-80 transition-opacity duration-200 cursor-pointer z-20',
            iconAlignmentClass(isMe)
          )}
        >
          <i className="material-symbols-outlined hover:scale-125 opacity-80 hover:opacity-100 duration-200 rounded-full" onClick={() => deleteMessage(id)}>delete</i>
          <i className="material-symbols-outlined hover:scale-125 opacity-80 hover:opacity-100 duration-200 rounded-full" onClick={() => alert('Pinned')}>keep</i>
          <i className="material-symbols-outlined hover:scale-125 opacity-80 hover:opacity-100 duration-200 rounded-full" onClick={() => alert('Forwarding')}>send</i>
          <i className="material-symbols-outlined hover:scale-125 opacity-80 hover:opacity-100 duration-200 rounded-full rotate-180" onClick={() => alert('Replying')}>reply</i>
          <i className="material-symbols-outlined hover:scale-125 opacity-80 hover:opacity-100 duration-200 rounded-full" onClick={() => alert('Liked')}>favorite</i>
        </div>
      </div>
    </motion.div>
  );
};

export default Message;
