import React from 'react';

export interface MediaItem {
  type: 'photo' | 'video' | 'audio' | 'file';
  url: string;
  filename?: string; // Optional filename for file downloads
}

interface RenderMedia {
  media: MediaItem;
  className?: string;
}

const RenderMedia: React.FC<RenderMedia> = ({ 
  media, 
  className = ''
}) => {
  const baseClasses = 'cursor-pointer overflow-hidden';

  const renderMediaContainer = (content: React.ReactNode, additionalClasses = '') => (
    <div className={`${baseClasses} ${className} ${additionalClasses}`}>
      {content}
    </div>
  );

  switch (media.type) {
    case 'photo':
      return renderMediaContainer(
        <img 
          src={media.url} 
          alt="Media attachment" 
          className="w-[var(--media-width)] max-h-[var(--media-height)] object-cover transition-all duration-300 hover:scale-125"
        />,
      );
    
    case 'video':
      return renderMediaContainer(
        <video controls className="w-full h-full">
          <source src={media.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>,
        'aspect-video' // Standard video aspect ratio (16:9)
      );
    
    case 'audio':
      return renderMediaContainer(
        <audio controls className="w-full">
          <source src={media.url} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>,
        'w-full' // Full width for audio player
      );
    
    case 'file':
      return (
        <div className={`${baseClasses} ${className} p-3 custom-border-b w-full`}>
          <a 
            href={media.url} 
            download={media.filename || true}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400"
          >
            <i className="material-symbols-outlined">download</i>
            <span className="hover:underline truncate">
              {media.filename || 'Download File'}
            </span>
          </a>
        </div>
      );
    
    default:
      return null;
  }
};

export default RenderMedia;