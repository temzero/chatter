import { AttachmentResponse } from "@/types/responses/message.response";

export const handleDownload = (attachment: AttachmentResponse) => {
    if (!attachment?.url) return;
    
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};