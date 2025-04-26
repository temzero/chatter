import React, { useRef, useEffect, useState, useMemo } from 'react';
import Message from './Message';
import ChannelMessage from './MessageChannel';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import bubbleSound from '@/assets/sound/message-bubble.mp3'
import popSound from '@/assets/sound/message-pop.mp3'

const ChatBox: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeChat, activeMessages } = useChat();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const playMessageSound = useSoundEffect(popSound || bubbleSound);

  const newMessageAdded = useMemo(() => {
    return activeMessages.length > previousMessageCount;
  }, [activeMessages.length, previousMessageCount]);

  useEffect(() => {
    setPreviousMessageCount(activeMessages.length);
  }, [activeMessages.length]);

  // Helper: Wait for all media elements (img, video, audio) to load
  const waitForMediaToLoad = (container: HTMLElement) => {
    const mediaElements = container.querySelectorAll('img, video, audio');
    const promises = Array.from(mediaElements).map(
      (media) =>
        new Promise((resolve) => {
          if (media instanceof HTMLImageElement) {
            // Image element
            if (media.complete) resolve(true);
            else media.onload = media.onerror = () => resolve(true);
          } else if (media instanceof HTMLVideoElement || media instanceof HTMLAudioElement) {
            // Video and Audio elements
            if (media.readyState === 4) resolve(true); // Video/Audio is ready
            else media.oncanplaythrough = () => resolve(true);
          }
        })
    );
    return Promise.all(promises);
  };

  // Scroll to bottom when new message (with media) is added
  useEffect(() => {
    if (newMessageAdded && containerRef.current) {
      const container = containerRef.current;
      waitForMediaToLoad(container).then(() => {
        container.scrollTop = container.scrollHeight;
        playMessageSound()
      });
    }
  }, [newMessageAdded, activeMessages]);

  const isChannel = activeChat?.type === 'channel';

  return (
    <div
      ref={containerRef}
      className="absolute z-0 flex-1 py-32 h-full w-full flex flex-col overflow-x-hidden overflow-y-auto p-6 backdrop-blur-sm"
    >
      {activeMessages.length > 0 ? (
        activeMessages.map((msg, index) =>
          isChannel ? (
            <ChannelMessage
              key={msg.id}
              id={msg.id}
              time={msg.time}
              text={msg.text}
              media={msg.media}
              containerRef={containerRef}
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
              containerRef={containerRef}
              shouldAnimate={newMessageAdded && index === activeMessages.length - 1}
            />
          )
        )
      ) : (
        <div className="h-full w-full flex items-center justify-center opacity-50 italic text-xl">
          No messages yet!
        </div>
      )}
    </div>
  );
};

export default ChatBox;
