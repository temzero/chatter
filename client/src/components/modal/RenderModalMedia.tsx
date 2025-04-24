import React, { useState } from 'react';
import { MediaProps } from './MediaModal';
import { formatFileSize } from '../ui/RenderMedia';
import { getFileIcon } from '../ui/RenderMedia';
import CustomAudioPlayer from '../ui/CustomAudioPlayer';

export const RenderModalMedia: React.FC<{ media: MediaProps }> = ({ media }) => {
  const [isZoom, setZoom] = useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null);

  function scrollToMiddle() {
    if (containerRef.current) {
      const container = containerRef.current;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      container.scrollTop = Math.max(0, (scrollHeight - clientHeight) / 2);
    }
  }

  function handleZoom() {
    setZoom(prev => !prev);
  }

  const handleDownload = (url: string, fileName?: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || '';
    link.click();
  };

  switch (media.type) {
    case 'image':
      return (
        <div ref={containerRef} className="w-full h-full overflow-auto p-6 scrollbar-hide">
          <img
            onClick={handleZoom}
            src={media.url}
            alt={media.alt || media.fileName || 'Image'}
            className={`mx-auto object-contain rounded-lg border-4 border-[var(--border-color)] transition-all duration-500 ${
              isZoom ? 'h-[188%] overflow-auto cursor-zoom-out' : 'h-full cursor-zoom-in'
            }`}
            draggable="false"
          />
        </div>
      );
    case 'video':
      return (
        <video
          src={media.url}
          controls
          autoPlay
          className="max-w-[90vw] max-h-[93vh] object-contain rounded hover:scale-150 hover:cursor-zoom-in transition-all duration-500 border-4 border-[var(--border-color)]"
          draggable="false"
        />
      );
      case 'audio':
        return (
          <div
            className="w-full max-w-md rounded-lg border-4 border-[var(--border-color)]"
          >
            <div className="p-4 custom-border-b flex items-center gap-1"><i className="material-symbols-outlined">music_note</i>{media.fileName || 'Audio file'}</div>
            <CustomAudioPlayer mediaUrl={media.url}/>
          </div>
        );
  
      case 'file':
        return (
          <div
            className="w-md pt-0 rounded-lg flex flex-col items-center border-4 border-[var(--border-color)]"
          >
            <i className="material-symbols-outlined text-8xl px-4">{getFileIcon(media.fileName)}</i>
            <div className="text-lg font-medium text-center">{media.fileName || 'File'}</div>
            <div className="text-sm text-gray-400 mt-1">
              {media.size ? formatFileSize(media.size) : 'Unknown size'}
            </div>
            <button
              onClick={() => handleDownload(media.url, media.fileName)}
              className="mt-4 w-full py-2 custom-border-t text-blue-500 hover:underline"
            >
              Download
            </button>
          </div>
        );
    default:
      return null;
  }
};