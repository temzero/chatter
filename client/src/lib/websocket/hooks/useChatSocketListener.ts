import { useEffect } from "react";
import { chatWebSocketService } from "../services/chat.websocket.service";
import { useMessageStore } from "@/stores/messageStore";
import { MessageResponse } from "@/types/responses/message.response";
import { useTypingStore } from "@/stores/typingStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useChatStore } from "@/stores/chatStore";
import { MessageStatus } from "@/types/enums/message";
import { audioService, SoundType } from "@/services/audio.service";
import { WsMessageResponse } from "@/types/websocket/websocketMessageRes";
import { toast } from "react-toastify";
import { handleSystemEventMessage } from "@/utils/handleSystemEventMessage";
import { webSocketService } from "../services/websocket.service";

export function useChatSocketListeners() {
  useEffect(() => {
    const handleNewMessage = async (WsMessageResponse: WsMessageResponse) => {
      const { meta, ...message } = WsMessageResponse as MessageResponse & {
        meta?: { isMuted?: boolean; isOwnMessage?: boolean };
      };

      const chatStore = useChatStore.getState();
      const messageStore = useMessageStore.getState();

      const isMuted = meta?.isMuted ?? false;
      const isOwnMessage = meta?.isOwnMessage ?? false;

      try {
        await chatStore.getOrFetchChatById(message.chatId, {
          fetchFullData: true,
        });
      } catch (error) {
        console.error("Failed to fetch chat for incoming message:", error);
        toast.error("New message received but chat not found!");
        return;
      }

      handleSystemEventMessage(message);

      if (isOwnMessage && messageStore.getMessageById(message.id)) {
        messageStore.updateMessageById(message.chatId, message.id, message);
      } else {
        messageStore.addMessage(message);

        const activeChatId = chatStore.activeChat?.id;
        if (!isMuted && activeChatId !== message.chatId) {
          audioService.playSound(SoundType.NEW_MESSAGE);
        }
      }
    };

    const handleMessageSaved = (message: MessageResponse) => {
      toast.success("Message saved!");
      useMessageStore.getState().addMessage(message);
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

    const handleMessageMarkedImportant = (update: {
      chatId: string;
      messageId: string;
      isImportant: boolean;
    }) => {
      console.log("isImportant", update.isImportant);
      useMessageStore
        .getState()
        .updateMessageById(update.chatId, update.messageId, {
          isImportant: update.isImportant,
        });
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
      console.log("handleMessageError", error);
      // Update specific message state
      useMessageStore
        .getState()
        .updateMessageById(error.chatId, error.messageId, {
          status: MessageStatus.FAILED,
        });

      // Show contextual error
      // toast.error(`Message failed: ${error.error}`);
    };

    const socket = webSocketService.getSocket();
    if (!socket) return;
    // Subscribe to events
    chatWebSocketService.onNewMessage(handleNewMessage);
    chatWebSocketService.onSaveMessage(handleMessageSaved);
    chatWebSocketService.onReaction(handleReaction);
    chatWebSocketService.onTyping(handleTyping);
    chatWebSocketService.onMessagesRead(handleMessagesRead);
    chatWebSocketService.onMessagePin(handleMessagePinned);
    chatWebSocketService.onImportantMessage(handleMessageMarkedImportant);
    chatWebSocketService.onDeleteMessage(handleMessageDeleted);
    chatWebSocketService.onMessageError(handleMessageError);

    return () => {
      const socket = webSocketService.getSocket();
      if (!socket) return;
      // Clean up listeners
      chatWebSocketService.removeAllListeners();
    };
  }, []);
}
