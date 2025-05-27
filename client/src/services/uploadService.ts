import API from "@/services/api/api"; // your configured axios instance

export const uploadService = {
  /**
   * Upload an image file
   * @param file - The image File object
   * @returns The uploaded image URL from server response
   */
  async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await API.post("/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // Allow more time for upload
      });

      // Assuming your NestJS controller returns { url: publicUrl }
      if (!data?.url) {
        throw new Error("Upload failed: No URL returned");
      }

      return data.url;
    } catch (error: unknown) {
      console.error("uploadImage failed:", error);
      throw new Error("Image upload failed");
    }
  },

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      await API.delete("/uploads", {
        data: { url: imageUrl },
      });
    } catch (error) {
      console.error("Failed to delete avatar", error);
      throw error;
    }
  },
};
