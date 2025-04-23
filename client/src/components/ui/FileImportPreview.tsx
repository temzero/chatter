// FileImportPreviews.tsx
import { motion } from 'framer-motion';
import React from 'react';

interface FileImportPreviewsProps {
  files: File[];
  urls: string[];
  onRemove: (index: number) => void;
}

const getFileType = (file: File): string => {
  const mime = file.type;
  const name = file.name.toLowerCase();

  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (mime.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return 'word';
  if (mime.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx')) return 'excel';
  if (mime.includes('zip') || name.endsWith('.zip') || name.endsWith('.rar')) return 'archive';

  return 'file';
};

const FileImportPreviews: React.FC<FileImportPreviewsProps> = ({ files, urls, onRemove }) => {
  return (
    <div className="flex gap-2 mb-2 w-full flex-wrap">
      {files.map((file, index) => {
        const url = urls[index];
        const fileType = getFileType(file);

        return (
          <motion.div
            key={index}
            className="relative w-[80px] h-[80px] group overflow-hidden"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {fileType === 'image' ? (
              <img
                src={url}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover rounded"
              />
            ) : fileType === 'video' ? (
            <div className='w-full h-full relative rounded overflow-hidden'>
                <div className='flex items-center justify-center absolute top-1 left-1 rounded-full backdrop-blur-lg aspect-square w-8 h-8 overflow-hidden'>
                    <i className="material-symbols-outlined">videocam</i>
                </div>
                <p className="two-line-truncate text-xs break-words absolute bottom-0 left-1">{file.name}</p>

                <video className="w-full h-full object-cover">
                    <source src={url} />
                </video>
            </div>
            ) : fileType === 'audio' ? (
              <div className="w-full h-full border-2 border-[var(--input-border-color)] rounded p-1 flex flex-col justify-between">
                <i className="material-symbols-outlined text-3xl">music_note</i>
                <p className="two-line-truncate text-xs break-words">{file.name}</p>
              </div>
            ) : (
              <div className="w-full h-full border-2 border-[var(--input-border-color)] rounded p-1 flex flex-col justify-between">
                <i className="material-symbols-outlined text-3xl -mt-1">
                  {{
                    pdf: 'picture_as_pdf',
                    word: 'description',
                    excel: 'grid_on',
                    archive: 'folder_zip',
                    file: 'insert_drive_file',
                  }[fileType]}
                </i>
                <span className="text-xs two-line-truncate break-words">{file.name}</span>
              </div>
            )}

            <button
              onClick={() => onRemove(index)}
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

export default FileImportPreviews;
