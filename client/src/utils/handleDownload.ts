import { MediaProps } from "@/data/types";

export const handleDownload = (currentMedia: MediaProps) => {
    if (!currentMedia?.url) return;
    
    const link = document.createElement('a');
    link.href = currentMedia.url;
    link.download = currentMedia.fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};