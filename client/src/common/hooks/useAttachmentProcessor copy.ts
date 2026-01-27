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

  // Convert File to AttachmentResponse with thumbnail extraction
  const processSingleAttachment = async (
    file: File,
    chatId?: string,
    messageId?: string,
  ): Promise<ProcessedAttachment> => {
    const tempId = uuidv4();

    // Determine attachment type
    const type = determineAttachmentType(file);

    // Base attachment
    const baseAttachment: ProcessedAttachment = {
      id: tempId,
      type,
      url: "", // Will be filled after upload
      messageId: messageId || `temp-${tempId}`,
      chatId: chatId || `temp-chat-${tempId}`,
      thumbnailUrl: null,
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

    // Extract metadata and thumbnail for media files
    if (type === AttachmentType.AUDIO || type === AttachmentType.VIDEO) {
      try {
        // For audio files, try to extract cover art
        if (type === AttachmentType.AUDIO) {
          const metadata = await parseBlob(file);
          const picture = metadata.common.picture?.[0];

          if (picture) {
            const pictureData = new Uint8Array(picture.data);
            const blob = new Blob([pictureData], { type: picture.format });
            baseAttachment.thumbnailUrl = URL.createObjectURL(blob);
          }

          // Extract duration if available
          if (metadata.format.duration) {
            baseAttachment.duration = Math.round(metadata.format.duration);
          }
        }

        // For video files, extract thumbnail
        if (type === AttachmentType.VIDEO) {
          const thumbnail = await extractVideoThumbnail(file);
          if (thumbnail) {
            baseAttachment.thumbnailUrl = thumbnail.url;
            baseAttachment.width = thumbnail.width;
            baseAttachment.height = thumbnail.height;
            baseAttachment.duration = thumbnail.duration;
          }
        }
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
      }
    }

    // For images, extract dimensions and create thumbnail
    if (type === AttachmentType.IMAGE) {
      try {
        const dimensions = await extractImageDimensions(file);
        baseAttachment.width = dimensions.width;
        baseAttachment.height = dimensions.height;

        // Create thumbnail from image file
        const thumbnailUrl = URL.createObjectURL(file);
        baseAttachment.thumbnailUrl = thumbnailUrl;
      } catch (error) {
        console.error(`Error processing image ${file.name}:`, error);
      }
    }

    return baseAttachment;
  };

  // Process multiple attachments
  const processAttachments = async (
    files: File[],
    chatId?: string,
    messageId?: string,
    append: boolean = true, // New parameter to control appending
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
        // Clean up thumbnail URL
        if (attachment.thumbnailUrl) {
          URL.revokeObjectURL(attachment.thumbnailUrl);
        }
      }
      return prev.filter((a) => a.id !== attachmentId);
    });
  }, []);

    const clearAllAttachments = useCallback(() => {
    // Clean up all thumbnail URLs
    processedAttachments.forEach((attachment) => {
      if (attachment.thumbnailUrl) {
        URL.revokeObjectURL(attachment.thumbnailUrl);
      }
    });
    // Clear the state
    setProcessedAttachments([]);
  }, [processedAttachments]);

  // Clean up all URLs on unmount
  useEffect(() => {
    return () => {
      processedAttachments.forEach((attachment) => {
        if (attachment.thumbnailUrl)
          URL.revokeObjectURL(attachment.thumbnailUrl);
      });
    };
  }, [processedAttachments]);

  return {
    processedAttachments,
    isProcessing,
    processAttachments,
    removeAttachment,
    clearAllAttachments
  };
};

const extractVideoThumbnail = (
  file: File,
): Promise<{
  url: string;
  width: number;
  height: number;
  duration?: number;
} | null> => {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(0.5, video.duration / 2);

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve({
                url,
                width: video.videoWidth,
                height: video.videoHeight,
                duration: video.duration,
              });
            } else {
              resolve(null);
            }
            URL.revokeObjectURL(video.src);
          }, "image/jpeg");
        } else {
          URL.revokeObjectURL(video.src);
          resolve(null);
        }
      };
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      resolve(null);
    };
  });
};

const extractImageDimensions = (
  file: File,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      resolve({ width: 0, height: 0 });
      URL.revokeObjectURL(img.src);
    };
  });
};
