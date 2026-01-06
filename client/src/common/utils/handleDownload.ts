import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { audioManager, SoundType } from "@/services/media/audioManager";

export const handleDownload = async (attachment: AttachmentResponse) => {
  if (!attachment?.url) return;

  try {
    const response = await fetch(attachment.url);
    if (!response.ok) throw new Error("Failed to fetch file");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = attachment.filename || "download";
    document.body.appendChild(link);

    // Play download sound right before triggering download
    audioManager.playSound(SoundType.DOWNLOAD);

    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Download failed. Please try again.");
  }
};
