import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { determineAttachmentType } from "@/common/utils/message/determineAttachmentType";
import { getFileIcon } from "@/common/utils/getFileIcon";

interface AttachmentImportedPreviewProps {
  files: File[];
  urls: string[];
  onRemove: (index: number) => void;
}

const AttachmentImportedPreview: React.FC<AttachmentImportedPreviewProps> = ({
  files,
  urls,
  onRemove,
}) => {
  const filesWithMeta = files.map((file, index) => ({
    file,
    url: urls[index],
    type: determineAttachmentType(file),
    originalIndex: index,
  }));

  const baseClass =
    "w-full h-full border-2 border-(--input-border-color) rounded";
  const textClass = "two-line-truncate text-xs break-words";

  return (
    <div className="flex flex-wrap mb-1 gap-1 p-1.5 custom-border rounded-lg glass-panel">
      <AnimatePresence mode="popLayout">
        {filesWithMeta.map(({ file, url, type, originalIndex }) => (
          <motion.div
            key={originalIndex}
            className="relative w-20 h-20 group overflow-hidden"
            initial={{ opacity: 0, x: 52 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 28 }}
            layout
          >
            {type === "image" ? (
              <img
                src={url}
                alt={`Preview ${originalIndex}`}
                className={`${baseClass} object-cover`}
              />
            ) : type === "video" ? (
              <div className={`${baseClass} relative overflow-hidden`}>
                <div className="flex items-center justify-center absolute top-1 left-1 rounded-full! backdrop-blur-lg aspect-square w-8 h-8 overflow-hidden">
                  <i className="material-symbols-outlined">videocam</i>
                </div>
                <p className={`${textClass} absolute bottom-0 left-1`}>
                  {file.name}
                </p>
                <video
                  src={url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                />
              </div>
            ) : (
              <div className={`${baseClass} p-1 flex flex-col justify-between`}>
                <i className={`material-symbols-outlined text-3xl! -mt-1`}>
                  {getFileIcon(file.name)}
                </i>
                <span className={textClass}>{file.name}</span>
              </div>
            )}

            <button
              onClick={() => {
                // Revoke object URLs for videos to free memory
                if (file.type.startsWith("video/")) {
                  URL.revokeObjectURL(url);
                }
                onRemove(originalIndex);
              }}
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
