import { AttachmentResponse } from "@/types/responses/message.response";

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
    link.click();
    document.body.removeChild(link);

    // Clean up the blob URL
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Download failed. Please try again.");
  }
};
