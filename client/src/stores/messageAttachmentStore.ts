import { create } from "zustand";
import { attachmentService } from "@/services/http/messageAttachmentService";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { handleError } from "@/common/utils/handleError";
import { useActiveChatId } from "./chatStore";
import { PaginationQuery } from "@/shared/types/queries/pagination-query";

const initialLimit = 30;

interface AttachmentStoreState {
  attachmentsByChat: Record<string, AttachmentResponse[]>; // chatId -> all attachments
  hasMore: Record<string, Record<AttachmentType, boolean>>; // chatId -> type -> boolean
  isLoading: boolean;
}

interface AttachmentStoreActions {
  fetchAttachments: (
    chatId: string,
    type?: AttachmentType,
    loadMore?: boolean
  ) => Promise<number>;
  getChatAttachments: (
    chatId: string,
    type?: AttachmentType
  ) => AttachmentResponse[];
  addMessageAttachments: (
    chatId: string,
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
  isLoading: false,
};

export const useAttachmentStore = create<
  AttachmentStoreState & AttachmentStoreActions
>((set, get) => ({
  ...initialState,

  fetchAttachments: async (chatId, type, loadMore = false) => {
    const state = get();

    if (
      loadMore &&
      (state.isLoading || !(state.hasMore[chatId]?.[type!] ?? true))
    ) {
      return 0;
    }

    set({ isLoading: true });

    try {
      const currentAttachments = state.attachmentsByChat[chatId] || [];
      const filteredAttachments = type
        ? currentAttachments.filter((att) => att.type === type)
        : currentAttachments;

      // Only use lastId when loading more OR when we have existing attachments
      const lastId =
        loadMore || filteredAttachments.length > 0
          ? filteredAttachments[filteredAttachments.length - 1]?.id
          : undefined;

      const query: PaginationQuery = {
        ...(!loadMore && { limit: initialLimit }), // Only pass limit for initial load
        ...(lastId && { lastId }),
      };

      const response = await attachmentService.fetchChatAttachments(
        chatId,
        type,
        query
      );

      if (response.items.length > 0) {
        addAttachmentsToState(chatId, response.items);
      }

      set((state) => ({
        hasMore: {
          ...state.hasMore,
          [chatId]: {
            ...(state.hasMore[chatId] || {}),
            [type!]: response.hasMore,
          },
        },
        isLoading: false,
      }));

      return response.items.length;
    } catch (error) {
      set({ isLoading: false });
      console.warn("Failed to fetch attachments");
      handleError(error, "Failed to fetch attachments");
    }
  },

  getChatAttachments: (chatId, type) => {
    const attachments = get().attachmentsByChat[chatId] || [];
    return type ? attachments.filter((att) => att.type === type) : attachments;
  },

  addMessageAttachments: (chatId, messageId, attachments) => {
    if (!chatId || !attachments || attachments.length === 0) return;

    const attachmentsWithMessageId = attachments.map((att) => ({
      ...att,
      messageId: att.messageId || messageId,
    }));

    addAttachmentsToState(chatId, attachmentsWithMessageId);
  },

  removeMessageAttachments: (messageId) => {
    set((state) => {
      const newAttachmentsByChat = { ...state.attachmentsByChat };
      for (const chatId in newAttachmentsByChat) {
        newAttachmentsByChat[chatId] = newAttachmentsByChat[chatId].filter(
          (att) => att.messageId !== messageId
        );
      }
      return { attachmentsByChat: newAttachmentsByChat };
    });
  },

  clearChatAttachments: (chatId) => {
    set((state) => {
      const newAttachmentsByChat = { ...state.attachmentsByChat };
      const newHasMore = { ...state.hasMore };
      delete newAttachmentsByChat[chatId];
      delete newHasMore[chatId];
      return {
        attachmentsByChat: newAttachmentsByChat,
        hasMore: newHasMore,
      };
    });
  },

  getAttachmentCounts: async (chatId) => {
    try {
      return await attachmentService.fetchAttachmentsCountByType(chatId);
    } catch (error) {
      handleError(error, "Failed to fetch attachment counts");
      return {};
    }
  },
}));

const addAttachmentsToState = (
  chatId: string,
  newAttachments: AttachmentResponse[]
) => {
  useAttachmentStore.setState((state) => {
    const current = state.attachmentsByChat[chatId] || [];
    const map = new Map(current.map((a) => [a.id, a]));

    for (const att of newAttachments) {
      map.set(att.id, att); // replaces if exists
    }

    const merged = Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      attachmentsByChat: {
        ...state.attachmentsByChat,
        [chatId]: merged,
      },
    };
  });
};

// Hooks
export const useActiveChatAttachments = (): AttachmentResponse[] => {
  const activeChatId = useActiveChatId();
  const attachmentsByChat = useAttachmentStore((s) => s.attachmentsByChat);
  return activeChatId ? attachmentsByChat[activeChatId] || [] : [];
};

export const getMessageAttachments = (chatId: string, messageId: string) => {
  const state = useAttachmentStore.getState();
  const attachments = state.attachmentsByChat[chatId] || [];
  return attachments.filter((att) => att.messageId === messageId).reverse();
};

export const useHasMore = (chatId: string) => {
  const state = useAttachmentStore.getState();
  const types = state.hasMore[chatId] || {};
  return Object.values(types).some((v) => v); // true if any type has more
};

export const useHasMoreForType = (chatId: string, type: AttachmentType) => {
  return useAttachmentStore((state) => state.hasMore[chatId]?.[type] ?? true);
};
