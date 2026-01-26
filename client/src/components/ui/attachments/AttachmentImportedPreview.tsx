import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { getFileIcon } from "@/common/utils/getFileIcon";
import { ProcessedAttachment } from "@/shared/types/responses/message-attachment.response";

interface AttachmentImportedPreviewProps {
  processedAttachments: ProcessedAttachment[];
  onRemove: (index: number) => void;
}

const AttachmentImportedPreview: React.FC<AttachmentImportedPreviewProps> = ({
  processedAttachments,
  onRemove,
}) => {
  const baseClass =
    "w-full h-full border-2 border-(--input-border-color) rounded";
  const textClass = "two-line-truncate text-xs break-words";

  return (
    <div className="flex flex-wrap mb-1 gap-1 p-1.5 custom-border rounded-lg glass-panel bg-(--primary-color)/25!">
      <AnimatePresence mode="popLayout">
        {processedAttachments.map((attachment, index) => (
          <motion.div
            key={attachment.id || index}
            className="relative w-20 h-20 group overflow-hidden"
            initial={{ opacity: 0, x: 52 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            layout
          >
            {attachment.type === AttachmentType.IMAGE ? (
              <img
                src={attachment.thumbnailUrl || attachment.url}
                alt={`Preview ${attachment.filename || index}`}
                className={`${baseClass} object-cover`}
              />
            ) : attachment.type === AttachmentType.VIDEO ? (
              <div className={`${baseClass} relative overflow-hidden`}>
                <div className="flex items-center justify-center absolute top-1 left-1 rounded-full! backdrop-blur aspect-square w-8 h-8 overflow-hidden">
                  <i className="material-symbols-outlined">videocam</i>
                </div>
                <p className={`${textClass} absolute bottom-0 left-1`}>
                  {attachment.filename}
                </p>
                {attachment.thumbnailUrl ||
                attachment.thumbnailUrl ||
                attachment.url ? (
                  <img
                    src={
                      attachment.thumbnailUrl ||
                      attachment.thumbnailUrl ||
                      attachment.url
                    }
                    alt={`Thumbnail ${attachment.filename}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <i className="material-symbols-outlined text-2xl">
                      videocam
                    </i>
                  </div>
                )}
              </div>
            ) : attachment.type === AttachmentType.AUDIO &&
              (attachment.thumbnailUrl || attachment.thumbnailUrl) ? (
              <div className={`${baseClass} relative overflow-hidden`}>
                <img
                  src={attachment.thumbnailUrl}
                  alt={`Cover ${attachment.filename}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <i className="material-symbols-outlined text-white text-2xl">
                    {getFileIcon(attachment.filename || "audio")}
                  </i>
                </div>
                <p
                  className={`${textClass} absolute bottom-0 left-1 text-white`}
                >
                  {attachment.filename}
                </p>
              </div>
            ) : (
              <div className={`${baseClass} p-1 flex flex-col justify-between`}>
                <i className={`material-symbols-outlined text-3xl! -mt-1`}>
                  {getFileIcon(attachment.filename || "file")}
                </i>
                <span className={textClass}>{attachment.filename}</span>
              </div>
            )}

            <button
              onClick={() => onRemove(index)}
              className="absolute inset-0 flex items-center justify-center bg-red-800/50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove file"
            >
              <span className="material-symbols-outlined text-3xl!">close</span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AttachmentImportedPreview;
