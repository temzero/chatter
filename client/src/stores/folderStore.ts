// stores/folderStore.ts
import { create } from "zustand";
import { FolderResponse } from "@/shared/types/responses/folder.response";
import { folderService } from "@/services/http/folderService";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { PaginationResponse } from "@/shared/types/responses/pagination.response";
import { handleError } from "@/common/utils/error/handleError";
import { audioManager, SoundType } from "@/services/audioManager";

interface FolderStoreState {
  folders: FolderResponse[];
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
}

interface FolderStoreActions {
  setInitialData: (data: PaginationResponse<FolderResponse>) => void;
  getFolderById: (folderId: string) => FolderResponse | undefined;
  createFolder: (folderData: {
    name: string;
    types: ChatType[];
    color: string | null;
    chatIds: string[];
  }) => Promise<FolderResponse>;
  addFolder: (folder: FolderResponse) => void;
  addChatToFolder: (chatId: string, folderId: string) => Promise<void>;
  updateFolder: (folder: Partial<FolderResponse>) => Promise<void>;
  reorderFolders: (newOrderIds: string[]) => Promise<void>;
  deleteFolder: (folderId?: string) => Promise<void>;

  clearFolderStore: () => void;
}

// Helper function to sort folders by position
const sortByPosition = (folders: FolderResponse[]) => {
  return [...folders].sort((a, b) => a.position - b.position);
};

const initialState: FolderStoreState = {
  folders: [],
  hasMore: false,
  isLoading: false,
  error: null,
};

export const useFolderStore = create<FolderStoreState & FolderStoreActions>(
  (set, get) => ({
    ...initialState,

    setInitialData: (data: PaginationResponse<FolderResponse>) => {
      set({
        folders: sortByPosition(data.items),
        hasMore: data.hasMore,
      });
    },

    getFolderById: (folderId: string) => {
      const { folders } = get();
      return folders.find((folder: { id: string }) => folder.id === folderId);
    },

    createFolder: async (folderData) => {
      try {
        const newFolder = await folderService.createFolder(folderData);
        set((state) => ({
          folders: sortByPosition([...state.folders, newFolder]),
        }));
        return newFolder;
      } catch (error) {
        set({ error: "Failed to create folder" });
        handleError(error, "Failed to create folder");
      }
    },

    addFolder: (folder) =>
      set((state) => ({
        folders: sortByPosition([...state.folders, folder]),
      })),

    updateFolder: async (folder) => {
      try {
        set({ isLoading: true, error: null });
        if (!folder.id) {
          throw new Error("Cannot update folder: missing folder id");
        }
        const updatedFolder = await folderService.updateFolder(
          folder.id,
          folder
        );
        set((state) => ({
          folders: sortByPosition(
            state.folders.map((f) => (f.id === folder.id ? updatedFolder : f))
          ),
          isLoading: false,
        }));
      } catch (error) {
        set({ error: "Failed to update folder", isLoading: false });
        handleError(error, "Failed to update folder");
      }
    },

    addChatToFolder: async (chatId, folderId) => {
      const folder = get().folders.find((f) => f.id === folderId);
      if (!folder) throw new Error("Folder not found");

      // Optimistic update: add chat locally first if not already in the folder
      if (!folder.chatIds.includes(chatId)) {
        folder.chatIds.push(chatId);
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === folderId ? { ...folder } : f
          ),
        }));
      }

      // API call
      await folderService.addChatsToFolder(folderId, [chatId]);
    },

    reorderFolders: async (newOrderIds) => {
      try {
        set({ isLoading: true });

        // Get current folders
        const currentFolders = get().folders;

        // Create new folder array with updated positions
        const updatedFolders = newOrderIds.map((id, index) => {
          const folder = currentFolders.find((f) => f.id === id);
          if (!folder) throw new Error(`Folder ${id} not found`);
          return { ...folder, position: index + 1 }; // 1-based indexing
        });

        // Optimistic update
        set({ folders: updatedFolders });

        // Prepare position updates for API
        const positionUpdates = updatedFolders.map((folder) => ({
          id: folder.id,
          position: folder.position,
        }));

        // API call
        await folderService.reorderFolders(positionUpdates);

        audioManager.playRandomSound([SoundType.CARD1, SoundType.CARD2, SoundType.CARD3, SoundType.CARD4])
        set({ isLoading: false });
      } catch (error) {
        // Revert on error
        set({
          error: "Failed to reorder folders",
          isLoading: false,
          folders: get().folders, // revert to previous state
        });
        handleError(error, "Failed to reorder folders");
      }
    },

    deleteFolder: async (folderId?: string) => {
      if (!folderId) return;
      try {
        await folderService.deleteFolder(folderId);
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== folderId),
          // No need to re-sort after deletion (order remains consistent)
        }));
      } catch (error) {
        set({ error: "Failed to delete folder" });
        handleError(error, "Failed to delete folder");
      }
    },

    clearFolderStore: () => {
      set({ ...initialState });
    },
  })
);

export const useFolders = () => useFolderStore((state) => state.folders);
