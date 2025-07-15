// services/folderService.ts
import API from "@/services/api/api";
import { FolderResponse } from "@/types/responses/folder.response";
import { ChatType } from "@/types/enums/ChatType";

export const folderService = {
  async createFolder(folderData: {
    name: string;
    types: ChatType[];
    color: string | null;
    chatIds: string[];
  }): Promise<FolderResponse> {
    const { data } = await API.post("/folders", folderData);
    return data;
  },

  async getFolders(): Promise<FolderResponse[]> {
    const { data } = await API.get("/folders");
    return data;
  },

  async getFolder(id: string): Promise<FolderResponse> {
    const { data } = await API.get(`/folders/${id}`);
    return data;
  },

  async updateFolder(
    id: string,
    updates: Partial<FolderResponse>
  ): Promise<FolderResponse> {
    const { data } = await API.patch(`/folders/${id}`, updates);
    return data;
  },

  async updateFolderPosition(
    id: string,
    position: number
  ): Promise<FolderResponse> {
    const { data } = await API.patch(`/folders/position/${id}`, position);
    return data;
  },

  async reorderFolders(
    positionUpdates: Array<{ id: string; position: number }>
  ): Promise<FolderResponse[]> {
    const { data } = await API.patch("/folders/reorder", {
      newOrder: positionUpdates,
    });
    return data;
  },

  async deleteFolder(id: string): Promise<void> {
    await API.delete(`/folders/${id}`);
  },

  async addChatsToFolder(
    folderId: string,
    chatIds: string[]
  ): Promise<FolderResponse> {
    const { data } = await API.post(`/folders/${folderId}/chats`, { chatIds });
    return data;
  },

  async removeChatFromFolder(
    folderId: string,
    chatId: string
  ): Promise<FolderResponse> {
    const { data } = await API.delete(`/folders/${folderId}/chats/${chatId}`);
    return data;
  },
};
