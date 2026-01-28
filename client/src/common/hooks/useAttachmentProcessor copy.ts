// hooks/useAttachmentProcessor.ts
import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { parseBlob } from "music-metadata-browser";
import { ProcessedAttachment } from "@/shared/types/responses/message-attachment.response";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { determineAttachmentType } from "../utils/message/determineAttachmentType";

export const useAttachmentProcessor = () => {
  const [processedAttachments, setProcessedAttachments] = useState<
    ProcessedAttachment[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper function to process audio files
  const processAudioAttachment = async (
    file: File,
    attachment: ProcessedAttachment,
  ) => {
    try {
      const metadata = await parseBlob(file);
      const picture = metadata.common.picture?.[0];

      // Extract album art thumbnail for audio files
      if (picture) {
        const pictureData = new Uint8Array(picture.data);
        const blob = new Blob([pictureData], { type: picture.format });
        attachment.thumbnailUrl = URL.createObjectURL(blob); // Only audio gets thumbnailUrl
      }

      // Extract duration if available
      if (metadata.format.duration) {
        attachment.duration = Math.round(metadata.format.duration);
      }
    } catch (error) {
      console.error("Error processing audio file:", error);
    }
  };

  // Helper function to process video files
  const processVideoAttachment = async (
    file: File,
    attachment: ProcessedAttachment,
  ) => {
    // Video file is already stored in attachment.url
    try {
      const video = document.createElement("video");
      const videoUrl = URL.createObjectURL(file);
      video.src = videoUrl;

      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          attachment.duration = video.duration;
          URL.revokeObjectURL(videoUrl);
          resolve();
        };

        video.onerror = () => {
          URL.revokeObjectURL(videoUrl);
          resolve(); // Don't fail if metadata extraction fails
        };
      });
    } catch (error) {
      console.error("Error getting video duration:", error);
    }
  };

  // Helper function to process image files
  const processImageAttachment = async (
    file: File,
    attachment: ProcessedAttachment,
  ) => {
    try {
      const dimensions = await extractImageDimensions(file);
      attachment.width = dimensions.width;
      attachment.height = dimensions.height;
    } catch (error) {
      console.error("Error processing image file:", error);
    }
  };

  // Convert File to AttachmentResponse with proper URL handling
  const processSingleAttachment = async (
    file: File,
    chatId?: string,
    messageId?: string,
  ): Promise<ProcessedAttachment> => {
    const tempId = uuidv4();

    // Determine attachment type
    const type = determineAttachmentType(file);

    // Create object URL for immediate preview (for all file types)
    const objectUrl = URL.createObjectURL(file);

    // Base attachment
    const baseAttachment: ProcessedAttachment = {
      id: tempId,
      type,
      url: objectUrl, // Main URL for preview/playback
      messageId: messageId || `temp-${tempId}`,
      chatId: chatId || `temp-chat-${tempId}`,
      thumbnailUrl: null, // Will only be set for audio files (album art)
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      width: null,
      height: null,
      duration: null,
      metadata: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      file,
    };

    // Handle different attachment types
    try {
      switch (type) {
        case AttachmentType.AUDIO:
          await processAudioAttachment(file, baseAttachment);
          break;

        case AttachmentType.VIDEO:
          await processVideoAttachment(file, baseAttachment);
          break;

        case AttachmentType.IMAGE:
          await processImageAttachment(file, baseAttachment);
          break;

        // For documents and other types, just keep the basic info
        default:
          // For documents, you might want to extract a different icon or preview
          // For now, we just use the file object URL
          break;
      }
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
    }

    return baseAttachment;
  };

  // Process multiple attachments
  const processAttachments = async (
    files: File[],
    chatId?: string,
    messageId?: string,
    append: boolean = true,
  ): Promise<ProcessedAttachment[]> => {
    setIsProcessing(true);

    try {
      const processingPromises = files.map((file) =>
        processSingleAttachment(file, chatId, messageId),
      );

      const attachments = await Promise.all(processingPromises);

      if (append) {
        setProcessedAttachments((prev) => [...prev, ...attachments]);
      } else {
        setProcessedAttachments(attachments);
      }

      return attachments;
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove an attachment and clean up URLs
  const removeAttachment = useCallback((attachmentId: string) => {
    setProcessedAttachments((prev) => {
      const attachment = prev.find((a) => a.id === attachmentId);
      if (attachment) {
        // Clean up main object URL (for all file types)
        if (attachment.url && attachment.url.startsWith("blob:")) {
          URL.revokeObjectURL(attachment.url);
        }

        // Clean up thumbnail URL (for audio files only)
        if (attachment.thumbnailUrl) {
          URL.revokeObjectURL(attachment.thumbnailUrl);
        }

        // Clean up video thumbnail from metadata if it exists
        if (attachment.metadata && "videoThumbnail" in attachment.metadata) {
          const videoThumbnailUrl = attachment.metadata
            .videoThumbnail as string;
          if (videoThumbnailUrl && videoThumbnailUrl.startsWith("blob:")) {
            URL.revokeObjectURL(videoThumbnailUrl);
          }
        }
      }
      return prev.filter((a) => a.id !== attachmentId);
    });
  }, []);

  const clearAllAttachments = useCallback(() => {
    // Clean up all URLs
    processedAttachments.forEach((attachment) => {
      // Clean up main object URL
      if (attachment.url && attachment.url.startsWith("blob:")) {
        URL.revokeObjectURL(attachment.url);
      }

      // Clean up thumbnail URL
      if (attachment.thumbnailUrl) {
        URL.revokeObjectURL(attachment.thumbnailUrl);
      }

      // Clean up video thumbnail from metadata
      if (attachment.metadata && "videoThumbnail" in attachment.metadata) {
        const videoThumbnailUrl = attachment.metadata.videoThumbnail as string;
        if (videoThumbnailUrl && videoThumbnailUrl.startsWith("blob:")) {
          URL.revokeObjectURL(videoThumbnailUrl);
        }
      }
    });

    // Clear the state
    setProcessedAttachments([]);
  }, [processedAttachments]);

  // Clean up all URLs on unmount
  useEffect(() => {
    return () => {
      processedAttachments.forEach((attachment) => {
        // Clean up main object URL
        if (attachment.url && attachment.url.startsWith("blob:")) {
          URL.revokeObjectURL(attachment.url);
        }

        // Clean up thumbnail URL
        if (attachment.thumbnailUrl) {
          URL.revokeObjectURL(attachment.thumbnailUrl);
        }

        // Clean up video thumbnail from metadata
        if (attachment.metadata && "videoThumbnail" in attachment.metadata) {
          const videoThumbnailUrl = attachment.metadata
            .videoThumbnail as string;
          if (videoThumbnailUrl && videoThumbnailUrl.startsWith("blob:")) {
            URL.revokeObjectURL(videoThumbnailUrl);
          }
        }
      });
    };
  }, [processedAttachments]);

  return {
    processedAttachments,
    isProcessing,
    processAttachments,
    removeAttachment,
    clearAllAttachments,
    setProcessedAttachments,
  };
};

const extractImageDimensions = (
  file: File,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    const imgUrl = URL.createObjectURL(file);
    img.src = imgUrl;

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(imgUrl);
    };

    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(imgUrl);
    };
  });
};
