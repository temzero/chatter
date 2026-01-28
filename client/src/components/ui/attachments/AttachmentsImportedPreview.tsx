import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { getFileIcon } from "@/common/utils/getFileIcon";
import { ProcessedAttachment } from "@/shared/types/responses/message-attachment.response";
import { PuffLoader } from "react-spinners";

interface AttachmentsImportedPreviewProps {
  processedAttachments: ProcessedAttachment[];
  isProcessing: boolean;
  onRemove: (index: number) => void;
}

const AttachmentsImportedPreview: React.FC<AttachmentsImportedPreviewProps> = ({
  processedAttachments,
  isProcessing,
  onRemove,
}) => {
  const baseClass =
    "w-full h-full border-2 border-(--border-color) bg-(--glass-panel-color) rounded";
  const textClass =
    "p-0.5 rounded-b truncate text-[10px] break-words bg-gradient-to-t from-black/100 to-transparent";
  const symbolClass =
    "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full! bg-black/30 backdrop-blur aspect-square w-9 h-9 flex items-center justify-center overflow-hidden";

  // Helper function to get thumbnail URL
  const getThumbnailUrl = (attachment: ProcessedAttachment) => {
    return attachment.thumbnailUrl || attachment.url;
  };

  // Helper function to render preview based on type
  const renderPreview = (attachment: ProcessedAttachment) => {
    const { type, filename } = attachment;
    const displayName = filename || "file";

    switch (type) {
      case AttachmentType.IMAGE:
        return (
          <img
            src={getThumbnailUrl(attachment)}
            alt={`Preview ${displayName}`}
            className={`${baseClass} object-cover`}
          />
        );

      case AttachmentType.VIDEO:
        return (
          <div className={`${baseClass} relative overflow-hidden`}>
            <div className={symbolClass}>
              <i className="material-symbols-outlined">videocam</i>
            </div>
            <p className={`${textClass} absolute bottom-0`}>{displayName}</p>
            {getThumbnailUrl(attachment) ? (
              <img
                src={getThumbnailUrl(attachment)}
                alt={`Thumbnail ${displayName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <i className="material-symbols-outlined text-2xl">videocam</i>
              </div>
            )}
          </div>
        );

      case AttachmentType.AUDIO:
        return (
          <div className={`${baseClass} relative rounded-full`}>
            {attachment.thumbnailUrl && (
              <img
                src={attachment.thumbnailUrl}
                alt={`Cover ${displayName}`}
                className="w-full h-full rounded-full custom-border object-cover"
              />
            )}
            <div className={symbolClass}>
              <i className="material-symbols-outlined text-2xl">
                {getFileIcon(displayName)}
              </i>
            </div>
            <p className={`${textClass} absolute bottom-0`}>{displayName}</p>
          </div>
        );

      default:
        return (
          <div className={`${baseClass} p-1 flex flex-col justify-between`}>
            <i className="material-symbols-outlined text-3xl! -mt-1">
              {getFileIcon(displayName)}
            </i>
            <span className={textClass}>{displayName}</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-wrap mb-1 gap-1 p-1.5 custom-border rounded-lg glass-panel bg-(--primary-color)/25! text-white">
      {isProcessing && processedAttachments.length === 0 && <PuffLoader />}

      <AnimatePresence mode="popLayout">
        {processedAttachments.map((attachment, index) => (
          <motion.div
            key={attachment.id || `attachment-${index}`}
            className="relative w-20 h-20 group overflow-hidden"
            initial={{ opacity: 0, x: 52 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            layout
          >
            {renderPreview(attachment)}

            <button
              onClick={() => {
                onRemove(index);
              }}
              className="absolute inset-0 flex items-center justify-center bg-red-800/70 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Remove ${attachment.filename || "file"}`}
            >
              <span className="material-symbols-outlined text-3xl!">close</span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AttachmentsImportedPreview;
