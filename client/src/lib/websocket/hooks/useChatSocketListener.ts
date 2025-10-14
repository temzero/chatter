import { useEffect } from "react";
import { toast } from "react-toastify";
import { chatWebSocketService } from "../services/chat.websocket.service";
import { useMessageStore } from "@/stores/messageStore";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { useTypingStore } from "@/stores/typingStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useChatStore } from "@/stores/chatStore";
import { MessageStatus } from "@/shared/types/enums/message-status.enum";
import { audioService, SoundType } from "@/services/audio.service";
import { handleSystemEventMessage } from "@/utils/handleSystemEventMessage";
import { webSocketService } from "../services/websocket.service";
import { WsEmitChatMemberResponse } from "@/shared/types/responses/ws-emit-chat-member.response";

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

        const activeChatId = chatStore.activeChat?.id;
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
      const { payload: data } = wsPinned;
      useChatStore.getState().setPinnedMessage(data.chatId, data.message);
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
