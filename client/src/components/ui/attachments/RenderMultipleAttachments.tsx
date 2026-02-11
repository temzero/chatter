import * as React from "react";
import clsx from "clsx";
import RenderAttachment from "./RenderAttachment";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { getMessageAttachments } from "@/stores/messageAttachmentStore";
import { LinkPreviewAttachment } from "../attachments/LinkPreviewAttachment";
import { useIsMobile } from "@/stores/deviceStore";
import { sortAttachments } from "@/common/utils/attachmentSorter";

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
  const isMobile = useIsMobile();

  if (!attachments) {
    attachments = getMessageAttachments(chatId, messageId);
  }

  const sortedAttachments = React.useMemo(() => {
    if (!attachments?.length) return null;
    return sortAttachments(attachments);
  }, [attachments]);

  if (!sortedAttachments) {
    return null;
  }

const { visual: visualAttachments, links: linkAttachments, ...remainingCategories } = sortedAttachments;

// Combine all the remaining attachments into one array
const otherAttachments = Object.values(remainingCategories).flat();

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

  const renderVisualMedia = (attachments: AttachmentResponse[]) => {
    const count = attachments.length;

    switch (count) {
      case 0:
        return null;
      case 1:
        return <RenderAttachment attachment={attachments[0]} />;
      case 3:
        return (
          <div className={`grid grid-cols-6 grid-rows-2 gap-px `}>
            <div className="col-span-4 row-span-2">
              <RenderAttachment attachment={attachments[0]} />
            </div>
            <div className="col-span-2">
              <RenderAttachment attachment={attachments[1]} />
            </div>
            <div className="col-span-2">
              <RenderAttachment attachment={attachments[2]} />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-4 grid-rows-1 gap-px">
            <div className="col-span-3 row-span-1">
              <RenderAttachment
                attachment={attachments[0]}
                className="w-full h-full rounded-l-lg"
              />
            </div>
            <div className="col-span-1 grid grid-rows-3 h-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="row-span-1">
                  <RenderAttachment
                    attachment={attachments[i]}
                    className="w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      default: {
        if (count % 3 === 0) {
          return RenderAttachmentGrid(attachments, 3);
        }

        // For other counts, show first 2 in 2 columns, then 3 columns for rest
        const firstTwo = attachments.slice(0, 2);
        const remaining = attachments.slice(2);

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
    <div key={`attachments-message-${messageId}`} className={`flex flex-col w-full ${className}`}>
      {linkAttachments.map((attachment) => (
        <LinkPreviewAttachment
          attachment={attachment}
          isInitAnimation={true}
          key={attachment.id}
          className={isMobile ? "min-w-[280px]" : "min-w-[400px]"}
        />
      ))}

      {renderVisualMedia(visualAttachments)}

      {/* Non-visual attachment */}
      {otherAttachments.map((mediaItem) => (
        <div key={mediaItem.id}>
          <RenderAttachment attachment={mediaItem} />
        </div>
      ))}
    </div>
  );
};

export default React.memo(RenderMultipleAttachments);
