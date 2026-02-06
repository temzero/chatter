import * as React from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import InfiniteScroller from "@/components/ui/layout/InfiniteScroller";
import RenderAttachment from "@/components/ui/attachments/RenderAttachment";
import Button from "@/components/ui/buttons/Button";

interface RenderMediaAttachmentsProps {
  attachments: AttachmentResponse[];
  selectedType: AttachmentType;
  onLoadMore: () => Promise<number>;
  hasMore: boolean;
}

const RenderMediaAttachments: React.FC<RenderMediaAttachmentsProps> = ({
  attachments,
  selectedType,
  onLoadMore,
  hasMore,
}) => {
  const { t } = useTranslation();

  if (attachments.length === 0) {
    return (
      <div className="flex justify-center items-center h-32 opacity-50">
        {t("common.messages.empty")}
      </div>
    );
  }

  const isGridLayout =
    selectedType === AttachmentType.IMAGE ||
    selectedType === AttachmentType.VIDEO;

  return (
    <InfiniteScroller
      onLoadMore={onLoadMore}
      hasMore={hasMore}
      className="pb-16"
      loader={
        <div className="p-4 text-center text-sm opacity-70">
          {t("common.loading.loading")}
        </div>
      }
    >
      <div
        className={clsx(
          isGridLayout ? "grid grid-cols-3" : "flex flex-col items-center"
        )}
      >
        {attachments.map((media, index) => (
          <div
            key={`${media.id}-${index}`}
            className={
              isGridLayout
                ? "overflow-hidden aspect-square custom-border"
                : "w-full"
            }
          >
            <RenderAttachment
              attachment={media}
              type="info"
              className={clsx(
                "cursor-pointer w-full",
                isGridLayout &&
                  "h-full hover:scale-125 transition-transform duration-300 ease-in-out"
              )}
              previewMode={false}
            />
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="w-full flex items-center justify-center py-2">
          <Button
            variant="link"
            onClick={onLoadMore}
            className="my-auto  flex items-center justify-center"
          >
            More...
          </Button>
        </div>
      )}
    </InfiniteScroller>
  );
};

export default React.memo(RenderMediaAttachments);
