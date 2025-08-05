import { useEffect } from "react";
import { chatWebSocketService } from "../services/chat.websocket.service";
import { useMessageStore } from "@/stores/messageStore";
import { MessageResponse } from "@/types/responses/message.response";
import { useTypingStore } from "@/stores/typingStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useChatStore } from "@/stores/chatStore";
import { MessageStatus } from "@/types/enums/message";
import { playSoundEffect } from "@/utils/playSoundEffect";
import newMessageSound from "@/assets/sound/message-pop.mp3";
import { WsMessageResponse } from "@/types/websocket/websocketMessageRes";
import { toast } from "react-toastify";
import { ChatMember } from "@/types/responses/chatMember.response";
import { useCurrentUserId } from "@/stores/authStore";
import { handleSystemEventMessage } from "@/utils/handleSystemEventMessage";

export function useChatSocketListeners() {
  const currentUserId = useCurrentUserId();

  useEffect(() => {
    const handleNewMessage = async (WsMessageResponse: WsMessageResponse) => {
      const { meta, ...message } = WsMessageResponse as MessageResponse & {
        meta?: {
          isMuted?: boolean;
          isOwnMessage?: boolean;
        };
      };
      console.log("newMessage", WsMessageResponse);

      const isMuted = meta?.isMuted ?? false;
      const isOwnMessage = meta?.isOwnMessage ?? false;

      const chatExists = useChatStore
        .getState()
        .chats.some((chat) => chat.id === message.chatId);

      if (!chatExists) {
        try {
          // Fetch both chat info and messages in one call
          await useChatStore.getState().fetchChatById(message.chatId, {
            fetchFullData: true,
          });
        } catch (error) {
          console.error("Failed to fetch chat for incoming message:", error);
          toast.error("New message received but chat not found!");
          return;
        }
      }

      handleSystemEventMessage(message);

      if (
        isOwnMessage &&
        useMessageStore.getState().getMessageById(message.id)
      ) {
        useMessageStore
          .getState()
          .updateMessageById(message.chatId, message.id, message);
      } else {
        useMessageStore.getState().addMessage(message);
        const activeChatId = useChatStore.getState().activeChat?.id;
        if (!isMuted && activeChatId !== message.chatId) {
          playSoundEffect(newMessageSound);
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

    const handleMessageMarkedImportant = (message: MessageResponse) => {
      useMessageStore
        .getState()
        .updateMessageById(message.chatId, message.id, message);
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
      console.log('handleMessageError', error)
      // Update specific message state
      useMessageStore
        .getState()
        .updateMessageById(error.chatId, error.messageId, {
          status: MessageStatus.FAILED,
        });

      // Show contextual error
      // toast.error(`Message failed: ${error.error}`);
    };

    const handleMembersAdded = (newMember: ChatMember) => {
      toast.success(`Member Added`);

      // Check if the added member is the current user
      const isMe = newMember.userId === currentUserId;
      toast.success(`Member added, isMe: ${isMe}`);
      if (isMe) {
        // Fetch the group chat details
        useChatStore
          .getState()
          .fetchChatById(newMember.chatId)
          .then(() => {
            toast.success(`You've been added to a new group chat`);
          });
      } else {
        const chat = useChatStore
          .getState()
          .chats.find((c) => c.id === newMember.chatId);
        const chatName = chat?.name || "the group";
        // For other members, just update the member list if viewing this chat
        useChatMemberStore.getState().addMemberLocally(newMember);
        toast.success(`${newMember.firstName} Joined ${chatName}`);
      }
    };

    const handleMemberRemoved = (member: ChatMember) => {
      toast.success(`Member Removed`);

      const isMe = member.userId === currentUserId;
      const memberName = member.nickname || member.firstName;
      toast.success(`Member Removed, isMe: ${isMe}`);

      if (isMe) {
        // Current user was removed - remove the entire chat
        useChatStore.getState().cleanupChat(member.chatId);
        toast.warning(`You've been removed from the chat`);
      } else {
        // Another member was removed - just update members list
        useChatMemberStore
          .getState()
          .clearChatMember(member.chatId, member.userId);
        console.log(`${memberName} has left the chat`);
        toast.info(`${memberName} has left the chat`);
      }
    };

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

    chatWebSocketService.onMemberAdded(handleMembersAdded);
    chatWebSocketService.onMemberRemoved(handleMemberRemoved);

    return () => {
      // Clean up listeners
      chatWebSocketService.offNewMessage(handleNewMessage);
      chatWebSocketService.offSaveMessage(handleMessageSaved);
      chatWebSocketService.offReaction(handleReaction);
      chatWebSocketService.offTyping(handleTyping);
      chatWebSocketService.offMessagesRead(handleMessagesRead);
      chatWebSocketService.offMessagePin(handleMessagePinned);
      chatWebSocketService.offImportantMessage(handleMessageMarkedImportant);
      chatWebSocketService.offDeleteMessage(handleMessageDeleted);
      chatWebSocketService.offMessageError(handleMessageError);

      chatWebSocketService.offMemberAdded(handleMembersAdded);
      chatWebSocketService.offMemberRemoved(handleMemberRemoved);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
