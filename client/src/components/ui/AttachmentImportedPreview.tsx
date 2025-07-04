// AttachmentImportedPreview.tsx
import { motion } from "framer-motion";
import React from "react";

interface AttachmentImportedPreviewProps {
  files: File[];
  urls: string[];
  onRemove: (index: number) => void;
}

const getFileType = (file: File): string => {
  const mime = file.type;
  const name = file.name.toLowerCase();

  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (mime === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (mime.includes("word") || name.endsWith(".doc") || name.endsWith(".docx"))
    return "word";
  if (mime.includes("excel") || name.endsWith(".xls") || name.endsWith(".xlsx"))
    return "excel";
  if (mime.includes("zip") || name.endsWith(".zip") || name.endsWith(".rar"))
    return "archive";

  return "file";
};

const AttachmentImportedPreview: React.FC<AttachmentImportedPreviewProps> = ({
  files,
  urls,
  onRemove,
}) => {
  // Create an array of files with their types and original indices
  const typedFiles = files.map((file, index) => ({
    file,
    url: urls[index],
    type: getFileType(file),
    originalIndex: index,
  }));

  // Define the desired order
  const typeOrder = [
    "image",
    "video",
    "audio",
    "pdf",
    "word",
    "excel",
    "archive",
    "file",
  ];

  // Sort files according to the desired order
  const sortedFiles = [...typedFiles].sort((a, b) => {
    return typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type);
  });

  return (
    <div className="flex gap-2 mb-2 w-full flex-wrap">
      {sortedFiles.map(({ file, url, type, originalIndex }) => {
        return (
          <motion.div
            key={originalIndex}
            className="relative w-[80px] h-[80px] group overflow-hidden"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {type === "image" ? (
              <img
                src={url}
                alt={`Preview ${originalIndex}`}
                className="w-full h-full object-cover rounded"
              />
            ) : type === "video" ? (
              <div className="w-full h-full relative rounded overflow-hidden">
                <div className="flex items-center justify-center absolute top-1 left-1 rounded-full backdrop-blur-lg aspect-square w-8 h-8 overflow-hidden">
                  <i className="material-symbols-outlined">videocam</i>
                </div>
                <p className="two-line-truncate text-xs break-words absolute bottom-0 left-1">
                  {file.name}
                </p>
                <video className="w-full h-full object-cover">
                  <source src={url} />
                </video>
              </div>
            ) : type === "audio" ? (
              <div className="w-full h-full border-2 border-[var(--input-border-color)] rounded p-1 flex flex-col justify-between">
                <i className="material-symbols-outlined text-3xl">music_note</i>
                <p className="two-line-truncate text-xs break-words">
                  {file.name}
                </p>
              </div>
            ) : (
              <div className="w-full h-full border-2 border-[var(--input-border-color)] rounded p-1 flex flex-col justify-between">
                <i className="material-symbols-outlined text-3xl -mt-1">
                  {
                    {
                      pdf: "picture_as_pdf",
                      word: "description",
                      excel: "grid_on",
                      archive: "folder_zip",
                      file: "insert_drive_file",
                    }[type]
                  }
                </i>
                <span className="text-xs two-line-truncate break-words">
                  {file.name}
                </span>
              </div>
            )}

            <button
              onClick={() => onRemove(originalIndex)}
              className="absolute inset-0 flex items-center justify-center bg-black/50 text-white text-3xl rounded opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove file"
            >
              ×
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AttachmentImportedPreview;
