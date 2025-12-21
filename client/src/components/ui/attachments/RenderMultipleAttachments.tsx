import * as React from "react";
import clsx from "clsx";
import RenderAttachment from "./RenderAttachment";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { getMessageAttachments } from "@/stores/messageAttachmentStore";
import { LinkPreviewAttachment } from "../attachments/LinkPreviewAttachment";

interface RenderMultipleAttachmentsProps {
  chatId: string;
  messageId: string;
  attachments?: AttachmentResponse[];
  className?: string;
}

const RenderMultipleAttachments: React.FC<RenderMultipleAttachmentsProps> = ({
  chatId,
  messageId,
  attachments,
  className = "",
}) => {
  if (!attachments) {
    attachments = getMessageAttachments(chatId, messageId);
  }
  const attachmentLength = attachments.length;

  if (!attachments || attachmentLength === 0) {
    return null;
  }

  // Categorize attachments by type
  const linkPreviews = attachments.filter(
    (a) => a.type === AttachmentType.LINK
  );
  const visualMedia = attachments.filter(
    (m) => m.type === AttachmentType.IMAGE || m.type === AttachmentType.VIDEO
  );
  const audioMedia = attachments.filter((a) => a.type === AttachmentType.AUDIO);
  const fileMedia = attachments.filter((a) => a.type === AttachmentType.FILE);

  const RenderAttachmentGrid = (items: AttachmentResponse[], cols: number) => (
    <div
      className={clsx("grid gap-px")}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
      }}
    >
      {items.map((mediaItem) => (
        <div key={mediaItem.id} className="aspect-square">
          <RenderAttachment attachment={mediaItem} />
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
          <div className={`grid grid-cols-6 grid-rows-2 gap-px `}>
            <div className="col-span-4 row-span-2">
              <RenderAttachment attachment={visualMedia[0]} />
            </div>
            <div className="col-span-2">
              <RenderAttachment attachment={visualMedia[1]} />
            </div>
            <div className="col-span-2">
              <RenderAttachment attachment={visualMedia[2]} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-4 grid-rows-1 gap-px">
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
      {linkPreviews.map((attachment) => (
        <LinkPreviewAttachment attachment={attachment} isInitAnimation={true} />
      ))}

      {renderVisualMedia()}

      {/* Non-visual attachment */}
      {[...audioMedia, ...fileMedia].map((mediaItem) => (
        <div key={mediaItem.id}>
          <RenderAttachment attachment={mediaItem} />
        </div>
      ))}
    </div>
  );
};

export default RenderMultipleAttachments;
