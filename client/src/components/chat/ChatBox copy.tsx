// src/components/ChatBox.tsx
import React, { useRef, useEffect, useState, useMemo } from "react";
import Message from "./Message";
import ChannelMessage from "./MessageChannel";
import { useSoundEffect } from "@/hooks/useSoundEffect";
import messageSound from "@/assets/sound/message-sent2.mp3";
import { useActiveChatMessages } from "@/stores/messageStore";
import { ChatType } from "@/types/enums/ChatType";
import { useActiveChat, useActiveMembersByChatId, useChatStore } from "@/stores/chatStore";
import { useTypingStore } from "@/stores/typingStore";
import TypingIndicator from "../ui/typingIndicator/TypingIndicator";

const ChatBox: React.FC = () => {
  // console.log("ChatBox mounted");
  const activeChat = useActiveChat();
  const chatType = activeChat?.type || ChatType.DIRECT;
  const activeChatId = activeChat?.id || "";
  const messages = useActiveChatMessages();
  const chatMembers = useActiveMembersByChatId(activeChatId) || [];
  // const chatMembers = useChatStore.getState().chatMembers[activeChatId] || [];

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [previousMessageCount, setPreviousMessageCount] = useState(0);

  const typingMap = useTypingStore((state) => state.typingMap);
  const typingUsers = useMemo(() => {
    const chatTypingMap = typingMap[activeChatId] || {};
    return (
      Object.entries(chatTypingMap)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, isTyping]) => isTyping)
        .map(([userId]) => userId)
    );
  }, [typingMap, activeChatId]);

  const playMessageSound = useSoundEffect(messageSound, 0.5);

  const newMessageAdded = useMemo(() => {
    return messages.length > previousMessageCount;
  }, [messages.length, previousMessageCount]);

  useEffect(() => {
    setPreviousMessageCount(messages.length);
  }, [messages.length]);

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

  useEffect(() => {
    if (newMessageAdded && containerRef.current) {
      const container = containerRef.current;
      waitForMediaToLoad(container).then(() => {
        container.scrollTop = container.scrollHeight;
        playMessageSound();
      });
    }
  }, [newMessageAdded, messages, playMessageSound]);

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
      className="p-6 py-16 flex-1 h-full w-full flex flex-col overflow-x-hidden overflow-y-auto backdrop-blur-sm"
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

              return chatType === ChatType.CHANNEL ? (
                <ChannelMessage key={msg.id} message={msg} />
              ) : (
                <Message
                  key={msg.id}
                  message={msg}
                  shouldAnimate={isNewMessage}
                  chatType={chatType}
                />
              );
            })}
          </React.Fragment>
        ))
      ) : (
        <div className="h-full w-full flex items-center justify-center opacity-50 italic text-xl">
          No messages yet!
        </div>
      )}

      <TypingIndicator
        chatId={activeChatId}
        userIds={typingUsers}
        members={chatMembers || []}
      />
    </div>
  );
};

export default ChatBox;
