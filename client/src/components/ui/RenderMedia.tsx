// src/components/RenderMedia.tsx
import React, { useState } from 'react';
import { MediaProps } from '@/data/media';
import CustomAudioPlayer from './CustomAudioPlayer';

interface RenderMediaProps {
  media: MediaProps;
  className?: string;
  type?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  return `${size} ${sizes[i]}`;
}

const getFileIcon = (fileName = '') => {
  const name = fileName.toLowerCase();

  if (name.endsWith('.pdf')) return 'picture_as_pdf';
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'description';
  if (name.endsWith('.xls') || name.endsWith('.xlsx')) return 'grid_on';
  if (name.endsWith('.zip') || name.endsWith('.rar')) return 'folder_zip';
  return 'insert_drive_file';
};

const RenderMedia: React.FC<RenderMediaProps> = ({
  media,
  className = '',
  type
}) => {
  const baseClasses = 'cursor-pointer overflow-hidden';
  const [hovered, setHovered] = useState(false);

  const renderContainer = (content: React.ReactNode, extraClass = '') => (
    <div
      className={`${baseClasses} ${className} ${extraClass}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {content}
    </div>
  );

  const handleDownloadClick = (url: string, fileName: string | undefined) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || true;
    link.click();
  };

  switch (media.type) {
    case 'photo':
      return renderContainer(
        <img
          src={media.url}
          alt="Media attachment"
          className="w-[var(--media-width)] max-h-[var(--media-height)] object-cover transition-all duration-300 hover:scale-125"
        />
      );

    case 'video':
      return renderContainer(
        <video className="relative aspect-video w-full h-full rounded overflow-hidden object-cover" controls>
          <source src={media.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );

    case 'audio':
      return renderContainer(
        <CustomAudioPlayer mediaUrl={media.url} fileName={media.fileName} type={type}/> // Use the custom audio player
      );

    case 'file':
      return renderContainer(
          <div
            className={`w-full p-2 flex items-center gap-2 custom-border-b overflow-hidden ${
              type === 'info' ? 'text-purple-500' : 'text-white bg-purple-600'
            }`}
            onClick={() => handleDownloadClick(media.url, media.fileName)}
          >

          <i className="material-symbols-outlined text-3xl">{getFileIcon(media.fileName)}</i>
            <a
              href={media.url}
              download={media.fileName || true}
              className={`truncate`}
            >
              {media.fileName || 'Download File'}
            </a>
          {hovered ?
            <span className="material-symbols-outlined ml-auto">download</span>
          : 
            <p className='opacity-70 ml-auto'>({media.size ? formatFileSize(media.size) : '???'})</p>
          }
        </div>
      );

    default:
      return null;
  }
};

export default RenderMedia;
