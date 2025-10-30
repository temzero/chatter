import clsx from "clsx";
import React, { useState, useMemo, useCallback } from "react";
import { getSetSidebarInfo } from "@/stores/sidebarInfoStore";
import { SlidingContainer } from "@/components/ui/layout/SlidingContainer";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";
import { useTranslation } from "react-i18next";
import {
  useAttachmentStore,
  useHasMore,
} from "@/stores/messageAttachmentStore"; // ADD IMPORT
import { useActiveChatId } from "@/stores/chatStore";
import { AttachmentResponse } from "@/shared/types/responses/message-attachment.response";
import RenderAttachment from "@/components/ui/attachments/RenderAttachment";
import InfiniteScroller from "@/components/ui/layout/InfiniteScroller";

const mediaTypes = ["images", "videos", "audio", "files"];

const ChatInfoMedia: React.FC = () => {
  const { t } = useTranslation();
  const setSidebarInfo = getSetSidebarInfo();
  const activeChatId = useActiveChatId();

  const [selectedType, setSelectedType] = useState<string>(mediaTypes[0]);
  const [direction, setDirection] = useState<number>(1);

  const attachmentTypeMap: Record<string, AttachmentType> = {
    images: AttachmentType.IMAGE,
    videos: AttachmentType.VIDEO,
    audio: AttachmentType.AUDIO,
    files: AttachmentType.FILE,
  };

  const selectedAttachmentType = attachmentTypeMap[selectedType];

  const { getChatAttachments, fetchMoreAttachments } = useAttachmentStore();

  // ADD THIS HOOK - type-specific hasMore
  const hasMoreAttachments = useHasMore(activeChatId || "");

  // Filter media by type directly from store
  const filteredAttachments = useMemo(() => {
    if (!activeChatId) return [];
    return getChatAttachments(activeChatId, selectedAttachmentType);
  }, [getChatAttachments, activeChatId, selectedAttachmentType]);

  const getTypeClass = useCallback(
    (type: string) =>
      `flex items-center justify-center cursor-pointer p-2 ${
        selectedType === type
          ? "opacity-100 font-bold"
          : "opacity-50 hover:opacity-80"
      }`,
    [selectedType]
  );

  const handleTypeChange = (type: string) => {
    if (type === selectedType) return;

    const currentIndex = mediaTypes.indexOf(selectedType);
    const newIndex = mediaTypes.indexOf(type);

    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedType(type);
  };

  const handleLoadMore = useCallback(async () => {
    if (!activeChatId) return 0;
    return fetchMoreAttachments(activeChatId, selectedAttachmentType);
  }, [activeChatId, fetchMoreAttachments, selectedAttachmentType]);

  const renderMediaContent = () => {
    if (filteredAttachments.length === 0) {
      return (
        <div className="flex justify-center items-center h-32 opacity-50">
          {t("common.messages.empty")}
        </div>
      );
    }

    return (
      <div
        className={clsx(
          selectedType === "files" || selectedType === "audio"
            ? "flex flex-col"
            : "grid grid-cols-3 pb-10"
        )}
      >
        {filteredAttachments.map((media: AttachmentResponse, index: number) => (
          <div
            key={`${media.messageId}-${media.id || index}`}
            className={
              selectedType === "files" || selectedType === "audio"
                ? "w-full"
                : "overflow-hidden aspect-square custom-border"
            }
          >
            <RenderAttachment
              attachment={media}
              type="info"
              className={
                selectedType === "files" || selectedType === "audio"
                  ? "w-full"
                  : "w-full h-full hover:scale-125 transition-transform duration-300 ease-in-out"
              }
              previewMode={false}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
      <header className="flex p-4 w-full items-center min-h-[var(--header-height)] custom-border-b">
        <h1 className="text-xl font-semibold">
          {t("sidebar_info.media_files.title")}
        </h1>
      </header>

      <div className="flex justify-around items-center custom-border-b w-full backdrop-blur-[120px]">
        {mediaTypes.map((type) => (
          <a
            key={type}
            className={getTypeClass(type)}
            onClick={() => handleTypeChange(type)}
          >
            {t(`sidebar_info.media_files.${type}`)}
          </a>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        <SlidingContainer uniqueKey={selectedType} direction={direction}>
          <InfiniteScroller
            onLoadMore={handleLoadMore}
            hasMore={hasMoreAttachments}
            loader={
              <div className="p-4 text-center text-sm opacity-70">
                {t("common.loading.loading")}
              </div>
            }
            className="h-full"
          >
            {renderMediaContent()}
          </InfiniteScroller>
        </SlidingContainer>
      </div>

      <a
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-10 flex items-center justify-center cursor-pointer opacity-50 hover:opacity-90 bg-[var(--sidebar-color)] select-none"
        onClick={() => setSidebarInfo(SidebarInfoMode.DEFAULT)}
      >
        <i className="material-symbols-outlined rotate-90">arrow_forward_ios</i>
      </a>
    </aside>
  );
};

export default ChatInfoMedia;
