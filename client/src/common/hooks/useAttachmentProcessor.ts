// hooks/useAttachmentProcessor.ts
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { parseBlob } from "music-metadata-browser";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { determineAttachmentType } from "../utils/message/determineAttachmentType";
import { ProcessedAttachment } from "@/shared/types/requests/attachment-upload.request";

export const useAttachmentProcessor = () => {
  const [processedAttachments, setProcessedAttachments] = useState<
    ProcessedAttachment[]
  >([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper function to process audio files
  // Updated processAudioAttachment - NO extra parameter needed
  const processAudioAttachment = async (
    file: File,
    attachment: ProcessedAttachment,
  ) => {
    // Auto-detect voice recordings by MIME type only
    const isVoiceRecording =
      file.type === "audio/webm" || file.type === "audio/webm;codecs=opus";

    try {
      // For voice recordings, use Audio API directly
      if (isVoiceRecording) {
        const audio = new Audio();
        audio.src = attachment.url;

        await new Promise<void>((resolve) => {
          audio.onloadedmetadata = () => {
            if (audio.duration && !isNaN(audio.duration)) {
              attachment.duration = Math.round(audio.duration);
            }
            resolve();
          };

          audio.onerror = () => {
            console.warn("Could not load audio metadata");
            attachment.duration = null;
            resolve();
          };
        });

        return; // Exit early
      }

      // For regular audio files, use music-metadata
      try {
        const metadata = await parseBlob(file);
        const picture = metadata.common.picture?.[0];

        if (picture) {
          const pictureData = new Uint8Array(picture.data);
          const blob = new Blob([pictureData], { type: picture.format });
          attachment.thumbnailUrl = URL.createObjectURL(blob);
        }

        if (metadata.format.duration) {
          attachment.duration = Math.round(metadata.format.duration);
        }
      } catch {
        console.warn("music-metadata failed, using Audio API fallback");

        const audio = new Audio();
        audio.src = attachment.url;

        await new Promise<void>((resolve) => {
          audio.onloadedmetadata = () => {
            if (audio.duration && !isNaN(audio.duration)) {
              attachment.duration = Math.round(audio.duration);
            }
            resolve();
          };
          audio.onerror = () => resolve();
        });
      }
    } catch (error) {
      console.error("Error processing audio file:", error);
      attachment.duration = null;
      attachment.thumbnailUrl = null;
    }
  };

  // Helper function to process video files
  const processVideoAttachment = async (
    videoBlobUrl: string, // Use existing blob URL
    attachment: ProcessedAttachment,
  ) => {
    try {
      const video = document.createElement("video");
      video.src = videoBlobUrl; // Use the main blob URL

      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          attachment.duration = video.duration;
          resolve();
        };

        video.onerror = () => {
          resolve(); // Don't fail if metadata extraction fails
        };
      });
    } catch (error) {
      console.error("Error getting video duration:", error);
    }
  };

  // Helper function to process image files
  const processImageAttachment = async (
    imageBlobUrl: string, // Use existing blob URL
    attachment: ProcessedAttachment,
  ) => {
    try {
      const dimensions = await extractImageDimensions(imageBlobUrl);
      attachment.width = dimensions.width;
      attachment.height = dimensions.height;
    } catch (error) {
      console.error("Error processing image file:", error);
    }
  };

  // Extract image dimensions using existing blob URL
  const extractImageDimensions = (
    imageBlobUrl: string,
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageBlobUrl; // Use the main blob URL

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        // DO NOT revoke the URL here - it's the main URL!
      };

      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
    });
  };

  // Convert File to AttachmentResponse with proper URL handling
  const processSingleAttachment = async (
    file: File,
    index: number,
  ): Promise<ProcessedAttachment> => {
    const tempId = uuidv4();
    // Determine attachment type
    const type = determineAttachmentType(file);
    // Create object URL for immediate preview (for all file types)
    const objectUrl = URL.createObjectURL(file);

    // Base attachment
    const baseAttachment: ProcessedAttachment = {
      id: `temp-${index}-${tempId}`, // Temporary ID for UI
      file, // Keep original file

      type,
      url: objectUrl, // Blob URL
      filename: file.name,
      size: file.size,
      mimeType: file.type,
      thumbnailUrl: null,
      width: null,
      height: null,
      duration: null,
    };

    // Handle different attachment types using existing blob URL
    try {
      switch (type) {
        case AttachmentType.AUDIO:
          await processAudioAttachment(file, baseAttachment);
          break;

        case AttachmentType.VIDEO:
          await processVideoAttachment(baseAttachment.url, baseAttachment);
          break;

        case AttachmentType.IMAGE:
          await processImageAttachment(baseAttachment.url, baseAttachment);
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
    append: boolean = true,
  ): Promise<ProcessedAttachment[]> => {
    setIsProcessing(true);

    try {
      const processingPromises = files.map((file, index) =>
        processSingleAttachment(file, index),
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
      }
      return prev.filter((a) => a.id !== attachmentId);
    });
  }, []);

  const clearAttachmentsInput = () => {
    setProcessedAttachments([]);
  };

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
    });

    // Clear the state
    clearAttachmentsInput();
  }, [processedAttachments]);

  return {
    processedAttachments,
    isProcessing,
    processAttachments,
    removeAttachment,
    clearAttachmentsInput,
    clearAllAttachments,
  };
};
