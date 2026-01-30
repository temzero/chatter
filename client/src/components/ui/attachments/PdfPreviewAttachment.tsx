// components/attachments/PdfPreviewAttachment.tsx
import { motion } from "framer-motion";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
// import { formatFileSize } from "@/common/utils/format/formatFileSize";
import { mediaViewerAnimations } from "@/common/animations/mediaViewerAnimations";
import { FadeLoader } from "react-spinners";
import { useEffect, useState } from "react";

interface PdfPreviewAttachmentProps {
  attachment: AttachmentResponse;
  rotation?: number;
}

export const PdfPreviewAttachment = ({
  attachment,
  rotation = 0,
}: PdfPreviewAttachmentProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(attachment.url)}&embedded=true&toolbar=0&navpanes=0`;

  const handleIframeLoaded = () => {
    setIsLoading(false);
    setIsError(false); // Clear any error state
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setIsError(true);
  };

  useEffect(() => {
    // Fallback timeout in case onLoad/onError don't fire
    const timer = setTimeout(() => {
      if (isLoading) {
        // Only trigger if still loading
        setIsLoading(false);
        setIsError(true);
      }
    }, 9000);

    return () => clearTimeout(timer);
  }, [isLoading]); // Add isLoading dependency

  return (
    <motion.div
      className="mx-auto my-auto rounded-lg overflow-hidden flex flex-col border-4 border-(--border-color) max-w-4xl w-full"
      animate={mediaViewerAnimations.rotation(rotation)}
    >
      <div className="relative w-full h-[500px] rounded overflow-hidden custom-border">
        {/* Loading/Error overlay - should be above iframe */}
        {(isLoading || isError) && (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/20 z-10">
            {isLoading && !isError && (
              <FadeLoader color="var(--primary-color)" />
            )}
            {isError && (
              <span className="material-symbols-outlined text-8xl! text-red-500">
                visibility_off
              </span>
            )}
          </div>
        )}

        <iframe
          src={googleViewerUrl}
          title={attachment.filename || "PDF Preview"}
          className="w-full h-full"
          sandbox="allow-same-origin allow-scripts allow-popups"
          onLoad={handleIframeLoaded}
          onError={handleIframeError}
        />
      </div>

      {/* PDF Info */}
      <div className="w-full rounded flex items-center justify-between p-1 text-(--text-color) bg-(--glass-panel-color)">
        <div className="flex items-center gap-2">
          <i className="material-symbols-outlined text-3xl! select-none">
            picture_as_pdf
          </i>
          <div className="truncate text-xl select-text">
            {(attachment.filename || "???").replace(/\.[^/.]+$/, "")}
          </div>
        </div>

        <a
          href={attachment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="h-full aspect-square rounded flex items-center justify-center opacity-80 hover:opacity-100 hover:text-white hover:bg-(--primary-green) cursor-pointer"
        >
          <span className="material-symbols-outlined text-3xl!">
            open_in_new
          </span>
        </a>
      </div>
    </motion.div>
  );
};
