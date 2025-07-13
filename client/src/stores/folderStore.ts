// stores/folderStore.ts
import { create } from "zustand";
import { FolderResponse } from "@/types/responses/folder.response"; // define this type from backend
import { folderService } from "@/services/folderService";
import { ChatType } from "@/types/enums/ChatType";

interface FolderStore {
  folders: FolderResponse[];
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  createFolder: (folderData: {
    name: string;
    types: ChatType[];
    color: string | null;
    chatIds: string[];
  }) => Promise<FolderResponse>;
  addFolder: (folder: FolderResponse) => void;
  removeFolder: (folderId: string) => void;
  updateFolder: (folder: FolderResponse) => void;
}

export const useFolderStore = create<FolderStore>((set) => ({
  folders: [],
  isLoading: false,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      const folders = await folderService.getFolders();
      console.log("Fetched folders:", folders);
      set({ folders, isLoading: false });
    } catch (error: unknown) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch folders",
        isLoading: false,
      });
    }
  },

  createFolder: async (folderData: {
    name: string;
    types: ChatType[];
    color: string | null;
    chatIds: string[];
  }) => {
    try {
      const newFolder = await folderService.createFolder(folderData);
      console.log("Created new folder:", newFolder);
      set((state) => {
        const updatedFolders = [...(state.folders || []), newFolder];
        console.log("Updated folders after creation:", updatedFolders);
        return { folders: updatedFolders };
      });
      return newFolder;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create folder";
      set({ error: message });
      throw new Error(message);
    }
  },

  addFolder: (folder) =>
    set((state) => ({ folders: [...state.folders, folder] })),

  removeFolder: (folderId) =>
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== folderId),
    })),

  updateFolder: (folder) =>
    set((state) => ({
      folders: state.folders.map((f) => (f.id === folder.id ? folder : f)),
    })),
}));
