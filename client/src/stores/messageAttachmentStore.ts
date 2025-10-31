import { create } from "zustand";
import { attachmentService } from "@/services/http/messageAttachmentService";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { handleError } from "@/common/utils/handleError";
import { useActiveChatId } from "./chatStore";

interface AttachmentStoreState {
  attachmentsByChat: Record<string, AttachmentResponse[]>; // chatId -> all attachments
  hasMore: Record<string, boolean>; // chatId -> boolean
  isLoading: boolean; // simplified global loading state
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
  isLoading: false,
};

export const useAttachmentStore = create<
  AttachmentStoreState & AttachmentStoreActions
>((set, get) => ({
  ...initialState,

  fetchAttachments: async (chatId, type) => {
    console.log("fetchAttachments", type);
    set({ isLoading: true });

    try {
      const response = await attachmentService.fetchChatAttachments(
        chatId,
        type
      );
      console.log("Attachment response", response);

      // Use helper to add and sort attachments
      addAttachmentsToState(chatId, response.items);

      set((state) => ({
        hasMore: { ...state.hasMore, [chatId]: response.hasMore },
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      handleError(error, "Failed to fetch attachments");
    }
  },

  fetchMoreAttachments: async (chatId: string, type?: AttachmentType) => {
    console.log("fetchMoreAttachments", type);
    const state = get();
    if (state.isLoading || !state.hasMore[chatId]) return 0;

    set({ isLoading: true });

    try {
      // Get current attachments and filter by type if provided
      const currentAttachments = state.attachmentsByChat[chatId] || [];
      const filteredAttachments = type
        ? currentAttachments.filter((att) => att.type === type)
        : currentAttachments;

      const lastAttachment =
        filteredAttachments[filteredAttachments.length - 1];
      const lastId = lastAttachment?.id; // API pagination key

      console.log("lastId", lastId);

      const query = lastId ? { lastId } : undefined;
      const response = await attachmentService.fetchChatAttachments(
        chatId,
        type,
        query
      );

      console.log("fetchMoreAttachments response", response);

      if (response.items.length > 0) {
        addAttachmentsToState(chatId, response.items);

        set((state) => ({
          hasMore: { ...state.hasMore, [chatId]: response.hasMore },
          isLoading: false,
        }));
      } else {
        set((state) => ({
          hasMore: { ...state.hasMore, [chatId]: false },
          isLoading: false,
        }));
      }

      return response.items.length;
    } catch (error) {
      set({ isLoading: false });
      handleError(error, "Failed to fetch more attachments");
      return 0;
    }
  },

  getChatAttachments: (chatId, type) => {
    const attachments = get().attachmentsByChat[chatId] || [];
    if (!type) return attachments;
    return attachments.filter((att) => att.type === type);
  },

  addMessageAttachments: (messageId, attachments) => {
    if (!attachments || attachments.length === 0) return;
    const chatId = attachments[0]?.chatId;
    if (!chatId) return;

    const attachmentsWithMessageId = attachments.map((att) => ({
      ...att,
      messageId: att.messageId || messageId,
    }));

    // Use helper to merge and sort
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
    const currentAttachments = state.attachmentsByChat[chatId] || [];

    // Merge existing and new attachments
    const merged = [...currentAttachments, ...newAttachments];

    // Sort by createdAt descending (newest first)
    merged.sort(
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

// EXPORT HOOKS
export const useActiveChatAttachments = (): AttachmentResponse[] | [] => {
  const activeChatId = useActiveChatId();
  return useAttachmentStore((state) =>
    activeChatId ? state.attachmentsByChat[activeChatId] || [] : []
  );
};

// export const getMessageAttachments = (chatId: string, messageId: string) => {
//   const state = useAttachmentStore.getState();
//   const attachments = state.attachmentsByChat[chatId] || [];
//   return attachments.filter((att) => att.messageId === messageId);
// };

export const getMessageAttachments = (chatId: string, messageId: string) => {
  const state = useAttachmentStore.getState();
  const attachments = state.attachmentsByChat[chatId] || [];

  return (
    attachments
      .filter((att) => att.messageId === messageId)
      // Sort by createdAt descending: newest first, oldest last
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  );
};

export const useHasMore = (chatId: string) => {
  return useAttachmentStore((state) => state.hasMore[chatId] ?? false);
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

    // Could add smarter logic here based on API pagination
    return true; // Default to true if we still might have more
  });
};
