import React from "react";
import RenderAttachment from "./RenderAttachment";
import { AttachmentResponse } from "@/types/responses/message.response";
import { AttachmentType } from "@/types/enums/attachmentType";

interface RenderMultipleAttachmentsProps {
  attachments: AttachmentResponse[];
  text?: string;
  className?: string;
}

const RenderMultipleAttachments: React.FC<RenderMultipleAttachmentsProps> = ({
  attachments,
  text,
  className = "",
}) => {
  if (attachments.length === 0) {
    return text ? (
      <div className="p-2">{text}</div>
    ) : (
      <span>No attachments available</span>
    );
  }

  // Categorize attachments by type
  const visualMedia = attachments.filter(
    (m) => m.type === AttachmentType.IMAGE || m.type === AttachmentType.VIDEO
  );
  const audioMedia = attachments.filter((a) => a.type === AttachmentType.AUDIO);
  const fileMedia = attachments.filter((a) => a.type === AttachmentType.FILE);

  const RenderAttachmentGrid = (items: AttachmentResponse[], cols: number) => (
    <div
      className={`grid gap-[1px] w-full`}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {items.map((mediaItem) => (
        <div key={mediaItem.id} className="aspect-square">
          <RenderAttachment attachment={mediaItem} className="w-full h-full" />
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
        return <RenderAttachment attachment={visualMedia[0]} />;
      case 3:
        return (
          <div className="grid grid-cols-6 grid-rows-2 gap-[1px]">
            <div className="col-span-4 row-span-2">
              <RenderAttachment attachment={visualMedia[0]} className="w-full h-full" />
            </div>
            <div className="col-span-2">
              <RenderAttachment attachment={visualMedia[1]} className="w-full h-full" />
            </div>
            <div className="col-span-2">
              <RenderAttachment attachment={visualMedia[2]} className="w-full h-full" />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-4 grid-rows-1 gap-[1px]">
            <div className="col-span-3 row-span-1">
              <RenderAttachment
                attachment={visualMedia[0]}
                className="w-full h-full rounded-l-lg"
              />
            </div>
            <div className="col-span-1 grid grid-rows-3 h-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="row-span-1">
                  <RenderAttachment
                    attachment={visualMedia[i]}
                    className="w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      default: {
        if (count % 3 === 0) {
          return RenderAttachmentGrid(visualMedia, 3);
        }

        // For other counts, show first 2 in 2 columns, then 3 columns for rest
        const firstTwo = visualMedia.slice(0, 2);
        const remaining = visualMedia.slice(2);

        return (
          <div>
            {firstTwo.length > 0 && RenderAttachmentGrid(firstTwo, 2)}
            {remaining.length > 0 && RenderAttachmentGrid(remaining, 3)}
          </div>
        );
      }
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {renderVisualMedia()}

      {/* Non-visual attachment */}
      {[...audioMedia, ...fileMedia].map((mediaItem) => (
        <div key={mediaItem.id}>
          <RenderAttachment attachment={mediaItem} />
        </div>
      ))}

      {/* Optional text content */}
      {text && <div className="p-2 break-words max-w-full">{text}</div>}
    </div>
  );
};

export default RenderMultipleAttachments;
