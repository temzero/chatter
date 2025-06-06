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
        <div className="grid grid-cols-6 grid-rows-2 gap-[1px]  w-[var(--media-width-large)]">
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
        <div className="grid grid-cols-4 grid-rows-1 gap-[1px]  w-[var(--media-width-large)]">
          {/* Large image on the left - takes full height and 3/4 width */}
          <div className="col-span-3 row-span-1">
            <RenderMedia 
              media={visualMedia[0]} 
              className="w-full h-full rounded-l-lg" 
            />
          </div>
          
          {/* Three images stacked vertically on the right - each takes 1/3 height */}
          <div className="col-span-1 grid grid-rows-3 h-full">
            <div className="row-span-1">
              <RenderMedia 
                media={visualMedia[1]} 
                className="w-full h-full" 
              />
            </div>
            <div className="row-span-1">
              <RenderMedia 
                media={visualMedia[2]} 
                className="w-full h-full" 
              />
            </div>
            <div className="row-span-1">
              <RenderMedia 
                media={visualMedia[3]} 
                className="w-full h-full" 
              />
            </div>
          </div>
        </div>
      );
    }

    else if (visualMediaLength % 3 === 0) {
        return (
          <div className="grid grid-cols-3 gap-[1px] w-[var(--media-width-large)]">
            {visualMedia.map((media) => (
              <div key={media.id} className="aspect-square">
                <RenderMedia
                  media={media}
                  className="w-full h-full"
                />
              </div>
            ))}
          </div>
        );
      } else if (visualMediaLength % 2 === 0) {
        const firstFour = visualMedia.slice(0, 4);
        const remaining = visualMedia.slice(4);
    
        return (
          <div className="w-[var(--media-width-large)]">
            <div className="grid grid-cols-2 gap-[1px]">
              {firstFour.map((media) => (
                <div key={media.id} className="aspect-square">
                  <RenderMedia
                    media={media}
                    className="w-full h-full"
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-[1px]">
              {remaining.map((media) => (
                <div key={media.id} className="aspect-square">
                  <RenderMedia
                    media={media}
                    className="w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      } else {
        const firstTwo = visualMedia.slice(0, 2);
        const remaining = visualMedia.slice(2);
    
        return (
          <div className="w-[var(--media-width-large)]">
            <div className="grid grid-cols-2 gap-[1px]">
              {firstTwo.map((media) => (
                <div key={media.id} className="aspect-square">
                  <RenderMedia
                    media={media}
                    className="w-full h-full"
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-[1px]">
              {remaining.map((media) => (
                <div key={media.id} className="aspect-square">
                  <RenderMedia
                    media={media}
                    className="w-full h-full"
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

export default RenderMultipleMedia;