// stores/folderStore.ts
import { create } from "zustand";
import { FolderResponse } from "@/types/responses/folder.response";
import { folderService } from "@/services/folderService";
import { ChatType } from "@/types/enums/ChatType";

interface FolderStore {
  folders: FolderResponse[];
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  getFolderById: (folderId: string) => FolderResponse | undefined;
  createFolder: (folderData: {
    name: string;
    types: ChatType[];
    color: string | null;
    chatIds: string[];
  }) => Promise<FolderResponse>;
  addFolder: (folder: FolderResponse) => void;
  updateFolder: (folder: Partial<FolderResponse>) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
}

// Helper function to sort folders by position
const sortByPosition = (folders: FolderResponse[]) => {
  return [...folders].sort((a, b) => a.position - b.position);
};

export const useFolderStore = create<FolderStore>((set, get) => ({
  folders: [],
  isLoading: false,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      const folders = await folderService.getFolders();
      set({ folders: sortByPosition(folders), isLoading: false });
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch folders",
        isLoading: false,
      });
    }
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
      const message =
        error instanceof Error ? error.message : "Failed to create folder";
      set({ error: message });
      throw new Error(message);
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
      const updatedFolder = await folderService.updateFolder(folder.id, folder);
      set((state) => ({
        folders: sortByPosition(
          state.folders.map((f) => (f.id === folder.id ? updatedFolder : f))
        ),
        isLoading: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update folder";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  deleteFolder: async (folderId: string) => {
    try {
      await folderService.deleteFolder(folderId);
      set((state) => ({
        folders: state.folders.filter((f) => f.id !== folderId),
        // No need to re-sort after deletion (order remains consistent)
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete folder";
      set({ error: message });
      throw new Error(message);
    }
  },
}));
