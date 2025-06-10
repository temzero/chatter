import React, { useRef, useEffect, useState, useMemo } from "react";
import Message from "./Message";
import ChannelMessage from "./MessageChannel";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import messageSound from "@/assets/sound/message-sent2.mp3";
import { useActiveChatMessages } from "@/stores/messageStore";
import { chatWebSocketService } from "@/lib/websocket/services/chat.socket.service";
import { MessageResponse } from "@/types/messageResponse";

interface ChatBoxProps {
  chatId?: string;
  isChannel?: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ chatId, isChannel = false }) => {
  const messages = useActiveChatMessages();
  // console.log("chat messages: ", messages);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);

  const [isTyping, setIsTyping] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);

  // Create sound effects with different volumes
  const playMessageSound = useSoundEffect(messageSound, 0.5);

  const newMessageAdded = useMemo(() => {
    return messages.length > previousMessageCount;
  }, [messages.length, previousMessageCount]);

  useEffect(() => {
    setPreviousMessageCount(messages.length);
  }, [messages.length]);

  // WebSocket event listeners
  useEffect(() => {
    if (!chatId) return;

    const handleNewMessage = (message: MessageResponse) => {
      // Only process if message belongs to current chat
      if (message.chatId === chatId) {
        // Your existing message handling logic
      }
    };

    const handleTyping = (data: {
      userId: string;
      chatId: string;
      isTyping: boolean;
    }) => {
      if (data.chatId === chatId) {
        setIsTyping(data.isTyping);
        setTypingUserId(data.userId);
      }
    };

    const handleMessagesRead = (data: {
      userId: string;
      chatId: string;
      timestamp: number;
    }) => {
      if (data.chatId === chatId) {
        // Handle read receipts
      }
    };

    // Subscribe to events
    chatWebSocketService.onNewMessage(handleNewMessage);
    chatWebSocketService.onTyping(handleTyping);
    chatWebSocketService.onMessagesRead(handleMessagesRead);

    // Cleanup on unmount
    return () => {
      chatWebSocketService.offNewMessage(handleNewMessage);
      chatWebSocketService.offTyping(handleTyping);
      chatWebSocketService.offMessagesRead(handleMessagesRead);
    };
  }, [chatId]);

  // Helper: Wait for all media elements (img, video, audio) to load
  const waitForMediaToLoad = (container: HTMLElement) => {
    const mediaElements = container.querySelectorAll("img, video, audio");
    const promises = Array.from(mediaElements).map(
      (media) =>
        new Promise((resolve) => {
          if (media instanceof HTMLImageElement) {
            if (media.complete) resolve(true);
            else media.onload = media.onerror = () => resolve(true);
          } else if (
            media instanceof HTMLVideoElement ||
            media instanceof HTMLAudioElement
          ) {
            if (media.readyState === 4) resolve(true);
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
        playMessageSound();
      });
    }
  }, [newMessageAdded, messages, playMessageSound]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups: { date: string; messages: typeof messages }[] = [];

    messages.forEach((msg) => {
      const messageDate = new Date(msg.createdAt).toLocaleDateString();
      const lastGroup = groups[groups.length - 1];

      if (!lastGroup || lastGroup.date !== messageDate) {
        groups.push({
          date: messageDate,
          messages: [msg],
        });
      } else {
        lastGroup.messages.push(msg);
      }
    });

    return groups;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="p-6 flex-1 h-full w-full flex flex-col overflow-x-hidden overflow-y-auto backdrop-blur-sm"
    >
      {messages.length > 0 ? (
        groupedMessages.map((group) => (
          <React.Fragment key={group.date}>
            <div className="sticky -top-5 z-10 flex justify-center mb-4">
              <div className="bg-black bg-opacity-30 text-white text-xs p-1 rounded">
                {group.date || "Today"}
              </div>
            </div>
            {group.messages.map((msg, index) => {
              const isNewMessage =
                newMessageAdded &&
                index === group.messages.length - 1 &&
                group === groupedMessages[groupedMessages.length - 1];

              return isChannel ? (
                <ChannelMessage key={msg.id} message={msg} />
              ) : (
                <Message
                  key={msg.id}
                  message={msg}
                  shouldAnimate={isNewMessage}
                />
              );
            })}
          </React.Fragment>
        ))
      ) : (
        <div className="h-full w-full flex items-center justify-center opacity-50 italic text-xl">
          No messages yet!
          {/* {isTyping && (
            <div className="typing-indicator">{typingUserId} is typing...</div>
          )} */}
        </div>
      )}

      {isTyping && (
        <div className="typing-indicator">{typingUserId} is typing...</div>
      )}
    </div>
  );
};

export default ChatBox;
