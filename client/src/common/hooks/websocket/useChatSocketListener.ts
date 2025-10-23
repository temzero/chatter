import { useEffect } from "react";
import { toast } from "react-toastify";
import { useMessageStore } from "@/stores/messageStore";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { useTypingStore } from "@/stores/typingStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useChatStore } from "@/stores/chatStore";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { audioService, SoundType } from "@/services/audio.service";
import { handleSystemEventMessage } from "@/common/utils/message/handleSystemEventMessage";
import { WsEmitChatMemberResponse } from "@/shared/types/responses/ws-emit-chat-member.response";
import { chatWebSocketService } from "@/services/websocket/chat.websocket.service";
import { webSocketService } from "@/services/websocket/websocket.service";

export function useChatSocketListeners() {
  useEffect(() => {
    // ======== Message Handlers ========
    const handleNewMessage = async (
      wsMessage: WsEmitChatMemberResponse<MessageResponse>
    ) => {
      const { payload: message, meta } = wsMessage;
      console.log("Received new message via WebSocket:", message);

      const chatStore = useChatStore.getState();
      const messageStore = useMessageStore.getState();

      const isMuted = meta?.isMuted ?? false;
      const isOwnMessage = meta?.isSender ?? false;

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

        const activeChatId = chatStore.activeChatId;
        if (!isMuted && activeChatId !== message.chatId) {
          audioService.playSound(SoundType.NEW_MESSAGE);
        }
      }
    };

    const handleMessageSaved = (
      wsMessage: WsEmitChatMemberResponse<MessageResponse>
    ) => {
      const { payload: message } = wsMessage;
      toast.success("Message saved!");
      useMessageStore.getState().addMessage(message);
    };

    // ======== Typing ========
    const handleTyping = (
      wsData: WsEmitChatMemberResponse<{
        chatId: string;
        userId: string;
        isTyping: boolean;
      }>
    ) => {
      const { payload: data } = wsData;
      const typingStore = useTypingStore.getState();
      if (data.isTyping) {
        typingStore.startTyping(data.chatId, data.userId);
      } else {
        typingStore.stopTyping(data.chatId, data.userId);
      }
    };

    // ======== Mark as read ========
    const handleMessagesRead = (
      wsData: WsEmitChatMemberResponse<{
        chatId: string;
        memberId: string;
        messageId: string;
      }>
    ) => {
      const { payload: data } = wsData;
      useChatMemberStore
        .getState()
        .updateMemberLastRead(data.chatId, data.memberId, data.messageId);
    };

    // ======== Reactions ========
    const handleReaction = (
      wsReaction: WsEmitChatMemberResponse<{
        messageId: string;
        reactions: { [emoji: string]: string[] };
      }>
    ) => {
      const { payload: data } = wsReaction;
      useMessageStore
        .getState()
        .updateMessageReactions(data.messageId, data.reactions);
    };

    // ======== Pin ========
    const handleMessagePinned = (
      wsPinned: WsEmitChatMemberResponse<{
        chatId: string;
        message: MessageResponse | null;
      }>
    ) => {
      const { payload } = wsPinned;
      const { chatId, message } = payload;
      if (!chatId || !message) return null;

      const isPinned = message.isPinned;

      // 1. Update pinnedMessage in chat store
      useChatStore
        .getState()
        .setPinnedMessage(chatId, isPinned ? message : null);

      // 2. Unpin all messages in the chat
      const allMessages = useMessageStore.getState().messages[chatId] || [];
      allMessages.forEach((msg) => {
        if (msg.isPinned && msg.id !== message.id) {
          useMessageStore.getState().updateMessageById(chatId, msg.id, {
            isPinned: false,
          });
        }
      });

      // 3. Update the target message
      useMessageStore.getState().updateMessageById(chatId, message.id, {
        isPinned,
      });
    };

    // ======== Important ========
    const handleMessageMarkedImportant = (
      wsImportant: WsEmitChatMemberResponse<{
        chatId: string;
        messageId: string;
        isImportant: boolean;
      }>
    ) => {
      const { payload: update } = wsImportant;
      console.log("isImportant", update.isImportant);
      useMessageStore
        .getState()
        .updateMessageById(update.chatId, update.messageId, {
          isImportant: update.isImportant,
        });
    };

    // ======== Delete ========
    const handleMessageDeleted = (
      wsDeleted: WsEmitChatMemberResponse<{ chatId: string; messageId: string }>
    ) => {
      const { payload: data } = wsDeleted;
      useMessageStore.getState().deleteMessage(data.chatId, data.messageId);
    };

    // ======== Error ========
    const handleMessageError = (
      wsError: WsEmitChatMemberResponse<{
        chatId: string;
        messageId: string;
        error: string;
        code?: string;
      }>
    ) => {
      const { payload: error } = wsError;
      console.log("handleMessageError", error);
      useMessageStore
        .getState()
        .updateMessageById(error.chatId, error.messageId, {
          status: MessageStatus.FAILED,
        });
    };

    // ======== Subscribe ========
    const socket = webSocketService.getSocket();
    if (!socket) return;

    chatWebSocketService.onNewMessage(handleNewMessage);
    chatWebSocketService.onSaveMessage(handleMessageSaved);
    chatWebSocketService.onReaction(handleReaction);
    chatWebSocketService.onTyping(handleTyping);
    chatWebSocketService.onMessagesRead(handleMessagesRead);
    chatWebSocketService.onMessagePin(handleMessagePinned);
    chatWebSocketService.onImportantMessage(handleMessageMarkedImportant);
    chatWebSocketService.onDeleteMessage(handleMessageDeleted);
    chatWebSocketService.onMessageError(handleMessageError);

    // ======== Cleanup ========
    return () => {
      const socket = webSocketService.getSocket();
      if (!socket) return;
      chatWebSocketService.removeAllListeners();
    };
  }, []);
}
