// stores/attachmentStore.ts
import { create } from "zustand";
import { attachmentService } from "@/services/http/messageAttachmentService";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { handleError } from "@/common/utils/handleError";
import { useActiveChatId } from "./chatStore";

interface AttachmentStoreState {
  attachmentsByChat: Record<string, AttachmentResponse[]>; // chatId -> all attachments
  hasMore: Record<string, boolean>; // chatId -> boolean
  isLoading: Record<string, boolean>; // chatId -> boolean
  pagination: Record<string, { lastId?: string }>; // chatId -> pagination info
}

interface AttachmentStoreActions {
  fetchAttachments: (chatId: string, type?: AttachmentType) => Promise<void>;
  fetchMoreAttachments: (
    chatId: string,
    type?: AttachmentType
  ) => Promise<number>;
  getChatAttachments: (
    chatId: string,
    type?: AttachmentType
  ) => AttachmentResponse[];
  addMessageAttachments: (
    messageId: string,
    attachments: AttachmentResponse[]
  ) => void;
  removeMessageAttachments: (messageId: string) => void;
  clearChatAttachments: (chatId: string) => void;
  getAttachmentCounts: (chatId: string) => Promise<Record<string, number>>;
}

const initialState: AttachmentStoreState = {
  attachmentsByChat: {},
  hasMore: {},
  isLoading: {},
  pagination: {},
};

export const useAttachmentStore = create<
  AttachmentStoreState & AttachmentStoreActions
>((set, get) => ({
  // Initial state - only one storage for attachments
  ...initialState,

  fetchAttachments: async (chatId, type) => {
    set((state) => ({
      isLoading: { ...state.isLoading, [chatId]: true },
    }));

    try {
      let response;
      if (type) {
        response = await attachmentService.getChatAttachments(chatId, type);
      } else {
        response = await attachmentService.getAllChatAttachments(chatId);
      }

      set((state) => ({
        attachmentsByChat: {
          ...state.attachmentsByChat,
          [chatId]: response.items,
        },
        hasMore: { ...state.hasMore, [chatId]: response.hasMore },
        isLoading: { ...state.isLoading, [chatId]: false },
        pagination: {
          ...state.pagination,
          [chatId]: { lastId: response.items[response.items.length - 1]?.id },
        },
      }));
    } catch (error) {
      set((state) => ({
        isLoading: { ...state.isLoading, [chatId]: false },
      }));
      handleError(error, "Failed to fetch attachments");
    }
  },

  fetchMoreAttachments: async (chatId, type) => {
    const state = get();
    if (state.isLoading[chatId] || !state.hasMore[chatId]) {
      return 0;
    }

    set((state) => ({
      isLoading: { ...state.isLoading, [chatId]: true },
    }));

    try {
      const pagination = state.pagination[chatId];
      const queries = pagination?.lastId
        ? { lastId: pagination.lastId }
        : undefined;

      let response;
      if (type) {
        response = await attachmentService.getChatAttachments(
          chatId,
          type,
          queries
        );
      } else {
        response = await attachmentService.getAllChatAttachments(
          chatId,
          queries
        );
      }

      if (response.items.length > 0) {
        const currentAttachments = state.attachmentsByChat[chatId] || [];

        set((state) => ({
          attachmentsByChat: {
            ...state.attachmentsByChat,
            [chatId]: [...currentAttachments, ...response.items],
          },
          hasMore: { ...state.hasMore, [chatId]: response.hasMore },
          isLoading: { ...state.isLoading, [chatId]: false },
          pagination: {
            ...state.pagination,
            [chatId]: { lastId: response.items[response.items.length - 1]?.id },
          },
        }));
      } else {
        set((state) => ({
          hasMore: { ...state.hasMore, [chatId]: false },
          isLoading: { ...state.isLoading, [chatId]: false },
        }));
      }
      return response.items.length;
    } catch (error) {
      set((state) => ({
        isLoading: { ...state.isLoading, [chatId]: false },
      }));
      handleError(error, "Failed to fetch more attachments");
      return 0;
    }
  },

  getChatAttachments: (chatId, type) => {
    const attachments = get().attachmentsByChat[chatId] || [];

    if (!type) return attachments;

    // Filter by type on the fly instead of storing separately
    return attachments.filter((attachment) => {
      switch (type) {
        case AttachmentType.IMAGE:
          return attachment.type === AttachmentType.IMAGE;
        case AttachmentType.VIDEO:
          return attachment.type === AttachmentType.VIDEO;
        case AttachmentType.AUDIO:
          return attachment.type === AttachmentType.AUDIO;
        case AttachmentType.FILE:
          return attachment.type === AttachmentType.FILE;
        default:
          return false;
      }
    });
  },

  addMessageAttachments: (messageId, attachments) => {
    if (!attachments || attachments.length === 0) return;

    // All attachments should have the same chatId and messageId
    const chatId = attachments[0]?.chatId;
    if (!chatId) return;

    // Ensure each attachment has the correct messageId
    const attachmentsWithMessageId = attachments.map((att) => ({
      ...att,
      messageId: att.messageId || messageId,
    }));

    set((state) => {
      const currentAttachments = state.attachmentsByChat[chatId] || [];

      // Remove existing attachments for this message to avoid duplicates
      const filteredAttachments = currentAttachments.filter(
        (att) => att.messageId !== messageId
      );

      // Add new attachments
      const newAttachments = [
        ...filteredAttachments,
        ...attachmentsWithMessageId,
      ];

      return {
        attachmentsByChat: {
          ...state.attachmentsByChat,
          [chatId]: newAttachments,
        },
      };
    });
  },

  removeMessageAttachments: (messageId) => {
    set((state) => {
      const newAttachmentsByChat = { ...state.attachmentsByChat };

      // Remove attachments for this message from all chats
      for (const chatId in newAttachmentsByChat) {
        newAttachmentsByChat[chatId] = newAttachmentsByChat[chatId].filter(
          (att) => att.messageId !== messageId
        );
      }

      return {
        attachmentsByChat: newAttachmentsByChat,
      };
    });
  },

  clearChatAttachments: (chatId) => {
    set((state) => {
      const newAttachmentsByChat = { ...state.attachmentsByChat };
      const newHasMore = { ...state.hasMore };
      const newIsLoading = { ...state.isLoading };
      const newPagination = { ...state.pagination };

      delete newAttachmentsByChat[chatId];
      delete newHasMore[chatId];
      delete newIsLoading[chatId];
      delete newPagination[chatId];

      return {
        attachmentsByChat: newAttachmentsByChat,
        hasMore: newHasMore,
        isLoading: newIsLoading,
        pagination: newPagination,
      };
    });
  },

  getAttachmentCounts: async (chatId: string) => {
    try {
      return await attachmentService.getAttachmentsCountByType(chatId);
    } catch (error) {
      handleError(error, "Failed to fetch attachment counts");
      return {};
    }
  },
}));

// EXPORT HOOKS
export const useActiveChatAttachments = (): AttachmentResponse[] | [] => {
  const activeChatId = useActiveChatId();
  return useAttachmentStore((state) =>
    activeChatId ? state.attachmentsByChat[activeChatId] || [] : []
  );
};

export const getMessageAttachments = (chatId: string, messageId: string) => {
  const state = useAttachmentStore.getState();
  const attachments = state.attachmentsByChat[chatId] || [];
  return attachments.filter((att) => att.messageId === messageId);
};


export const useHasMoreForType = (chatId: string, type?: AttachmentType) => {
  return useAttachmentStore((state) => {
    if (!chatId) return false;

    // If no type specified, use general hasMore
    if (!type) {
      return state.hasMore[chatId] ?? true;
    }

    const hasMoreGeneral = state.hasMore[chatId] ?? true;

    // If no general hasMore, definitely no more for any type
    if (!hasMoreGeneral) return false;

    // Get current attachments of this type
    const attachments = state.attachmentsByChat[chatId] || [];
    const typeAttachments = attachments.filter(
      (attachment) => attachment.type === type
    );

    // Simple heuristic: if we have few attachments of this type,
    // there might be more (this could be enhanced based on your API)
    if (typeAttachments.length === 0) {
      return true; // No attachments yet, might have some
    }

    // You could add more sophisticated logic here based on your API
    // For example, if you know each page returns 20 items:
    // return typeAttachments.length % 20 === 0; // If divisible by page size, might have more

    return true; // Default to true if we have general hasMore
  });
};

export const useHasMore = (chatId: string) => {
  return useAttachmentStore((state) => {
    return state.hasMore[chatId] ?? true;
  });
};
