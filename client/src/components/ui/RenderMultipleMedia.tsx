import React from "react";
import RenderMedia from "./RenderMedia";

export interface MediaProps {
  id: string;
  type: "image" | "video" | "audio" | "file";
  url: string;
  messageId: string;
  fileName?: string;
  size?: number;
  duration?: number;
}

interface RenderMultipleMediaProps {
  media: MediaProps[];
  text?: string;
  className?: string;
}

const RenderMultipleMedia: React.FC<RenderMultipleMediaProps> = ({
  media,
  text,
  className = "",
}) => {
  if (media.length === 0) {
    return text ? (
      <div className="p-2">{text}</div>
    ) : (
      <span>No media available</span>
    );
  }

  // Categorize media by type
  const visualMedia = media.filter(
    (m) => m.type === "image" || m.type === "video"
  );
  const audioMedia = media.filter((m) => m.type === "audio");
  const fileMedia = media.filter((m) => m.type === "file");

  const renderMediaGrid = (items: MediaProps[], cols: number) => (
    <div
      className={`grid gap-[1px] w-full`}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {items.map((mediaItem) => (
        <div key={mediaItem.id} className="aspect-square">
          <RenderMedia media={mediaItem} className="w-full h-full" />
        </div>
      ))}
    </div>
  );

  const renderVisualMedia = () => {
    const count = visualMedia.length;

    switch (count) {
      case 0:
        return null;
      case 1:
        return <RenderMedia media={visualMedia[0]} />;
      case 3:
        return (
          <div className="grid grid-cols-6 grid-rows-2 gap-[1px] w-[var(--media-width-large)]">
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
      case 4:
        return (
          <div className="grid grid-cols-4 grid-rows-1 gap-[1px] w-[var(--media-width-large)]">
            <div className="col-span-3 row-span-1">
              <RenderMedia
                media={visualMedia[0]}
                className="w-full h-full rounded-l-lg"
              />
            </div>
            <div className="col-span-1 grid grid-rows-3 h-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="row-span-1">
                  <RenderMedia
                    media={visualMedia[i]}
                    className="w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      default:
        { if (count % 3 === 0) {
          return renderMediaGrid(visualMedia, 3);
        }

        // For other counts, show first 2 in 2 columns, then 3 columns for rest
        const firstTwo = visualMedia.slice(0, 2);
        const remaining = visualMedia.slice(2);

        return (
          <div className="w-[var(--media-width-large)]">
            {firstTwo.length > 0 && renderMediaGrid(firstTwo, 2)}
            {remaining.length > 0 && renderMediaGrid(remaining, 3)}
          </div>
        ); }
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {renderVisualMedia()}

      {/* Non-visual media */}
      {[...audioMedia, ...fileMedia].map((mediaItem) => (
        <div key={mediaItem.id} className="mt-2">
          <RenderMedia media={mediaItem} />
        </div>
      ))}

      {/* Optional text content */}
      {text && <div className="p-2 break-words max-w-full">{text}</div>}
    </div>
  );
};

export default RenderMultipleMedia;
