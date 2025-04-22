import React from 'react';
import RenderMedia, { MediaItem } from './RenderMedia';

interface RenderMultipleMediaProps {
  media: MediaItem[];
  className?: string;
}

const RenderMultipleMedia: React.FC<RenderMultipleMediaProps> = ({ media, className = '' }) => {
  if (media.length === 0) {
    return <span>No media available</span>;
  }

  if (media.length === 1) {
    return <RenderMedia media={media[0]} className={`${className}`} />;
  }

  // Special layout for 3 images (one large, two small)
  if (media.length === 3) {
    return (
      <div className={`grid grid-cols-6 grid-rows-2 ${className}`}>
        <div className="col-span-4 row-span-2">
          <RenderMedia media={media[0]} className="w-full h-full object-cover" />
        </div>
        <div className="col-span-2">
          <RenderMedia media={media[1]} className="w-full h-full object-cover" />
        </div>
        <div className="col-span-2">
          <RenderMedia media={media[2]} className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  return (
    <div className={`grid ${getGridClass(media.length)} ${className}`}>
      {media.map((m, index) => (
        <div key={index} className={`relative ${getItemClass(media.length, index)}`}>
          <RenderMedia 
            media={m} 
            className="absolute inset-0 w-full h-full object-cover" 
          />
        </div>
      ))}
    </div>
  );
};

// Helper functions for grid layout
const getGridClass = (count: number): string => {
  switch (count) {
    case 2: return 'grid-cols-2';
    case 4: return 'grid-cols-2';
    case 5: return 'grid-cols-3 grid-rows-2';
    default: return 'grid-cols-3';
  }
};

const getItemClass = (count: number, index: number): string => {
  // Special handling for 5 items (3 in first row, 2 in second)
  if (count === 5 && index === 0) return 'col-span-2 row-span-2';
  if (count === 5 && index < 3) return '';
  if (count === 5 && index >= 3) return 'col-span-1';
  return '';
};

export default RenderMultipleMedia;