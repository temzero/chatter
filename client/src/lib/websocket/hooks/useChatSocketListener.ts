import { useEffect } from "react";
import { chatWebSocketService } from "../services/chat.websocket.service";
import { useMessageStore } from "@/stores/messageStore";
import { MessageResponse } from "@/types/responses/message.response";
import { useTypingStore } from "@/stores/typingStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useActiveChatId, useChatStore } from "@/stores/chatStore";
import { MessageStatus } from "@/types/enums/message";
import { playSoundEffect } from "@/utils/playSoundEffect";
import newMessageSound from "@/assets/sound/message-pop.mp3";
import { WsMessageResponse } from "@/types/websocket/websocketMessageRes";

export function useChatSocketListeners() {
  const activeChatId = useActiveChatId();
  console.log("activeChatId", activeChatId);
  useEffect(() => {
    const handleNewMessage = (WsMessageResponse: WsMessageResponse) => {
      const { meta, ...message } = WsMessageResponse as MessageResponse & {
        meta?: {
          isMuted?: boolean;
          isOwnMessage?: boolean;
        };
      };

      const isMuted = meta?.isMuted ?? false;
      const isOwnMessage = meta?.isOwnMessage ?? false;

      if (
        isOwnMessage &&
        useMessageStore.getState().getMessageById(message.id)
      ) {
        useMessageStore
          .getState()
          .updateMessageById(message.chatId, message.id, message);
      } else {
        useMessageStore.getState().addMessage(message);

        if (!isMuted && activeChatId !== message.chatId) {
          playSoundEffect(newMessageSound);
        }
      }
    };

    const handleTyping = (data: {
      chatId: string;
      userId: string;
      isTyping: boolean;
    }) => {
      const typingStore = useTypingStore.getState();
      if (data.isTyping) {
        typingStore.startTyping(data.chatId, data.userId);
      } else {
        typingStore.stopTyping(data.chatId, data.userId);
      }
    };

    // New handler for mark as read
    const handleMessagesRead = (data: {
      chatId: string;
      memberId: string;
      messageId: string;
    }) => {
      useChatMemberStore
        .getState()
        .updateMemberLastRead(data.chatId, data.memberId, data.messageId);
    };

    const handleReaction = (data: {
      messageId: string;
      reactions: { [emoji: string]: string[] };
    }) => {
      useMessageStore
        .getState()
        .updateMessageReactions(data.messageId, data.reactions);
    };

    const handleMessagePinned = (data: {
      chatId: string;
      message: MessageResponse | null;
    }) => {
      useChatStore.getState().setPinnedMessage(data.chatId, data.message);
    };

    const handleMessageDeleted = (data: {
      messageId: string;
      chatId: string;
    }) => {
      useMessageStore.getState().deleteMessage(data.chatId, data.messageId);
    };

    const handleMessageError = (error: {
      messageId: string;
      chatId: string;
      error: string;
      code?: string;
    }) => {
      // Update specific message state
      useMessageStore
        .getState()
        .updateMessageById(error.chatId, error.messageId, {
          status: MessageStatus.FAILED,
        });

      // Show contextual error
      // toast.error(`Message failed: ${error.error}`);
    };

    // Subscribe to events
    chatWebSocketService.onNewMessage(handleNewMessage);
    chatWebSocketService.onReaction(handleReaction);
    chatWebSocketService.onTyping(handleTyping);
    chatWebSocketService.onMessagesRead(handleMessagesRead);
    chatWebSocketService.onMessagePin(handleMessagePinned);
    chatWebSocketService.onDeleteMessage(handleMessageDeleted);
    chatWebSocketService.onMessageError(handleMessageError);

    return () => {
      // Clean up listeners
      chatWebSocketService.offNewMessage(handleNewMessage);
      chatWebSocketService.offReaction(handleReaction);
      chatWebSocketService.offTyping(handleTyping);
      chatWebSocketService.offMessagesRead(handleMessagesRead);
      chatWebSocketService.offMessagePin(handleMessagePinned);
      chatWebSocketService.offDeleteMessage(handleMessageDeleted);
      chatWebSocketService.offMessageError(handleMessageError);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
