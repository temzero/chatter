import React, { useState } from 'react';
import { MediaProps } from './MediaModal';
import { formatFileSize } from '@/hooks/formatFileSize';
import { getFileIcon } from '@/hooks/getFileIcon';
import CustomAudioPlayer from '../ui/CustomAudioPlayer';
import { handleDownload } from '@/hooks/handleDownload';



export const RenderModalMedia = ({ media, rotation = 0 }: { media: MediaProps, rotation?: number }) => {
  const [isZoom, setZoom] = useState(false);
  const [isHorizontal, setIsHorizontal] = useState<boolean | null>(null); // null until image loads

  function handleZoom() {
    setZoom(prev => !prev);
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setIsHorizontal(naturalWidth > naturalHeight);
  };

  switch (media.type) {
    case 'image':
      return (
          <div
            className={`w-full h-full flex items-center justify-center scrollbar-hide overflow-auto ${
              isHorizontal ? '' : 'py-5'
            }`}
          >
          <img
          //  border-4 border-[var(--border-color)]
            onClick={handleZoom}
            onLoad={handleImageLoad}
            src={media.url}
            alt={media.alt || media.fileName || 'Image'}
            className={`mx-auto my-auto object-contain transition-all duration-500 ease-in-out rounded ${
              isHorizontal === null
                ? '' // Don't apply width/height until orientation is known
                : isHorizontal
                ? `${isZoom ? 'w-[100vw] max-h-[200vh] cursor-zoom-out' : 'w-[80vw] max-h-[80vh] cursor-zoom-in'}`
                : `${isZoom ? 'h-[160vh] cursor-zoom-out' : 'h-[93vh] cursor-zoom-in'}`
            }`}
            draggable="false"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: 'all 0.3s ease',
            }}
          />
        </div>
      );
    case 'video':
      return (
        <video
        src={media.url}
        controls
        autoPlay
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          setIsHorizontal(video.videoWidth > video.videoHeight);
        }}
        className={`object-contain transition-all duration-500 ease-in-out rounded ${
          isHorizontal === null
            ? ''
            : isHorizontal
            ? 'w-[80vw] max-h-[80vh]'
            : 'h-[93vh] max-w-[80vw]'
        }`}
        draggable="false"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'all 0.3s ease',
        }}
      />
      );
      case 'audio':
        return (
          <div
            className="max-w-md rounded-lg border-4 border-[var(--border-color)]"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: 'all 0.3s ease',
            }}
          >
            <div className="p-4 custom-border-b flex items-center gap-1"><i className="material-symbols-outlined">music_note</i>{media.fileName || 'Audio file'}</div>
            <CustomAudioPlayer mediaUrl={media.url}/>
          </div>
        );
  
      case 'file':
        return (
          <div
            className="mx-auto my-auto w-md pt-0 rounded-lg flex flex-col items-center border-4 border-[var(--border-color)]"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: 'all 0.3s ease',
            }}
          >
            <i className="material-symbols-outlined text-8xl px-4">{getFileIcon(media.fileName)}</i>
            <div className="text-lg font-medium text-center">{media.fileName || 'File'}</div>
            <div className="text-sm text-gray-400 mt-1">
              {media.size ? formatFileSize(media.size) : 'Unknown size'}
            </div>
            <button
              onClick={() => handleDownload(media)}
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