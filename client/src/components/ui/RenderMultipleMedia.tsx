import React from 'react';
import RenderMedia from './RenderMedia';

export interface MediaProps {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
  messageId: string;
  fileName?: string;
  size?: number;
  duration?: number;
}

interface RenderMultipleMediaProps {
  media: MediaProps[];
  text?: string
  className?: string;
}

const RenderMultipleMedia: React.FC<RenderMultipleMediaProps> = ({ media, text, className = '' }) => {
  if (media.length === 0) {
    return <span>No media available</span>;
  }

  // Separate visual media (images and videos) from non-visual (files and audio)
  const visualMedia = media.filter(m => m.type === 'image' || m.type === 'video');

  const audioItems = media.filter(m => m.type === 'audio');
  const fileItems = media.filter(m => m.type === 'file');
  const nonVisualMedia = [...audioItems, ...fileItems];

  function renderVisualMedia (visualMediaLength: number) {

    if (visualMediaLength === 1) {
      return <RenderMedia media={visualMedia[0]} />
    }

    // Special layout for 3 visual media items (one large, two small)
    else if (visualMediaLength === 3) {
      return (
        <div className="grid grid-cols-6 grid-rows-2 w-[var(--media-width-large)]">
          <div className="col-span-4 row-span-2">
            <RenderMedia media={visualMedia[0]} className="w-full h-full" />
          </div>
          <div className="col-span-2">
            <RenderMedia media={visualMedia[1]} className="w-full h-full" />
          </div>
          <div className="col-span-2">
            <RenderMedia media={visualMedia[2]} className="w-full h-full" />
          </div>
        </div>
      );
    }

    else if (visualMediaLength === 4) {
      return (
        <div className="grid grid-cols-4 grid-rows-1 w-[var(--media-width-large)]">
          {/* Large image on the left - takes full height and 3/4 width */}
          <div className="col-span-3 row-span-1">
            <RenderMedia 
              media={visualMedia[0]} 
              className="w-full h-full object-cover rounded-l-lg" 
            />
          </div>
          
          {/* Three images stacked vertically on the right - each takes 1/3 height */}
          <div className="col-span-1 grid grid-rows-3 h-full">
            <div className="row-span-1">
              <RenderMedia 
                media={visualMedia[1]} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="row-span-1">
              <RenderMedia 
                media={visualMedia[2]} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="row-span-1">
              <RenderMedia 
                media={visualMedia[3]} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>
      );
    }

    else if (visualMediaLength % 2 === 0) {
      return (
        <div className={`grid grid-cols-2 w-[var(--media-width-large)]`}>
          {visualMedia.map((media, index) => (
            <div key={media.id} className="aspect-square">
              <RenderMedia
                media={media}
                className={`w-full h-full object-cover ${
                  index === 0 ? 'rounded-tl-lg rounded-bl-lg' : 
                  index === 1 ? 'rounded-tr-lg rounded-br-lg' : 
                  ''
                }`}
              />
            </div>
          ))}
        </div>
      );
    }

    else {
      return (
        <div className={`flex flex-col w-[var(--media-width-large)]`}>
          {/* First row with all except last 3 items */}
          {visualMediaLength > 3 && (
            <div className="grid grid-cols-2">
              {visualMedia.slice(0, -3).map((media) => (
                <div key={media.id} className="aspect-square">
                  <RenderMedia
                    media={media}
                    className={`w-full h-full object-cover`}
                  />
                </div>
              ))}
            </div>
          )}
          
          {/* Second row with last 3 items */}
          <div className="grid grid-cols-3">
            {visualMedia.slice(-3).map((media) => (
              <div key={media.id} className="aspect-square">
                <RenderMedia
                  media={media}
                  className={`w-full h-full object-cover`}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }
  }

  // For multiple visual media items (with optional non-visual items at bottom)
  return (
    <div className={`flex flex-col ${className}`}>
      {renderVisualMedia(visualMedia.length)}
      {nonVisualMedia.length > 0 && (
        <div className="">
          {nonVisualMedia.map((m, index) => (
            <RenderMedia key={index} media={m}/>
          ))}
        </div>
      )}
      {text && <h1 className="p-2 break-words max-w-full">{text}</h1>}
    </div>
  );
};

// // Helper functions for grid layout
// const getGridClass = (count: number): string => {
//   switch (count) {
//     case 4: return 'grid-cols-2';
//     case 5: return 'grid-cols-3 grid-rows-2';
//     default: return 'grid-cols-3';
//   }
// };

// const getItemClass = (count: number, index: number): string => {
//   // Special handling for 5 items (3 in first row, 2 in second)
//   if (count === 5 && index === 0) return 'col-span-2 row-span-2';
//   if (count === 5 && index < 3) return '';
//   if (count === 5 && index >= 3) return 'col-span-1';
//   return '';
// };

export default RenderMultipleMedia;