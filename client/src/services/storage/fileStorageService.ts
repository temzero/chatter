// src/services/fileStorageService.ts
import API from "@/services/api/api";
import logFormData from "@/common/utils/logFormdata";

type UploadResponse = {
  url: string;
};

type DeleteResponse = {
  success: boolean;
};

export const fileStorageService = {
  /**
   * Upload file via backend (processed by NestJS)
   * @param file - File object to upload
   * @param oldUrl - delete old image
   * @param type - Upload type (e.g., 'avatar', 'group-chat')
   * @returns Public URL of the uploaded file
   */
  // Client-side service
  async uploadAvatar(
    file: File,
    oldUrl: string,
    type: "user" | "group" = "user"
  ): Promise<string> {
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("oldUrl", oldUrl);
    formData.append("type", type);
    logFormData(formData);

    try {
      const endpoint = `/storage/avatar`;
      const response = await API.post<UploadResponse>(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response?.data?.url) throw new Error("No URL returned");
      return response.data.url;
    } catch (error) {
      console.error(`[StorageService] Upload failed (${type}):`, error);
      throw new Error(`Failed to upload ${type}`);
    }
  },

  async uploadFile(file: File, type: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    logFormData(formData);

    try {
      const endpoint = `/storage/${type}`;
      const { data } = await API.post<UploadResponse>(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!data?.url) throw new Error("No URL returned");
      return data.url;
    } catch (error) {
      console.error(`[StorageService] Upload failed (${type}):`, error);
      throw new Error(`Failed to upload ${type}`);
    }
  },

  /**
   * Delete file via backend
   * @param url - Full public URL of the file to delete
   * @param type - File type (e.g., 'avatar')
   */
  async deleteAvatar(
    url: string,
    type: "user" | "group" = "user"
  ): Promise<void> {
    try {
      await API.delete<DeleteResponse>(`/storage/${type}`, {
        data: { url },
      });
    } catch (error) {
      console.error(`[StorageService] Delete failed (${type}):`, error);
      throw new Error(`Failed to delete ${type}`);
    }
  },

  /**
   * Replace file (upload new + delete old)
   * @param newFile - New file to upload
   * @param oldUrl - Old file URL to delete (optional)
   * @param type - File type category
   */
  async replaceFile(
    newFile: File,
    oldUrl?: string,
    type: "user" | "group" = "user"
  ): Promise<string> {
    try {
      const newUrl = await this.uploadFile(newFile, type);
      if (oldUrl) await this.deleteAvatar(oldUrl, type);
      return newUrl;
    } catch (error) {
      console.error(`[StorageService] Replace failed (${type}):`, error);
      throw error; // Re-throw for handling in calling code
    }
  },
};
