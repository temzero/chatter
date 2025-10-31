import API from "@/services/api/api";
import { FolderResponse } from "@/shared/types/responses/folder.response";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { PaginationQuery } from "@/shared/types/queries/pagination-query";
import { PaginationResponse } from "@/shared/types/responses/pagination.response";

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

  async fetchFolders(
    query?: PaginationQuery
  ): Promise<PaginationResponse<FolderResponse>> {
    const { data } = await API.get("/folders", {
      params: query,
    });

    return data.payload; // matches SuccessResponse<PaginationResponse<FolderResponse>>
  },

  async updateFolder(
    id: string,
    updates: Partial<FolderResponse>
  ): Promise<FolderResponse> {
    const { data } = await API.patch(`/folders/update/${id}`, updates);
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
    const { data } = await API.post(`/folders/add-chats/${folderId}/chats`, {
      chatIds,
    });
    return data;
  },

  async removeChatFromFolder(
    folderId: string,
    chatId: string
  ): Promise<FolderResponse> {
    const { data } = await API.delete(
      `/folders/remove-chat/${folderId}/chats/${chatId}`
    );
    return data;
  },
};
