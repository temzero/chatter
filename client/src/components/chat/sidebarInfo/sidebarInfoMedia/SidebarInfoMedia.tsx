import React, { useState, useCallback, useEffect } from "react";
import { getSetSidebarInfo } from "@/stores/sidebarInfoStore";
import { SlidingContainer } from "@/components/ui/layout/SlidingContainer";
import { AttachmentType } from "@/shared/types/enums/attachment-type.enum";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";
import { useTranslation } from "react-i18next";
import {
  useActiveChatAttachments,
  useAttachmentStore,
  useHasMoreForType,
} from "@/stores/messageAttachmentStore";
import { useActiveChatId } from "@/stores/chatStore";
import RenderMediaAttachments from "./RenderMediaAttachments";

const attachmentTypeMap: Record<string, AttachmentType> = {
  images: AttachmentType.IMAGE,
  videos: AttachmentType.VIDEO,
  audio: AttachmentType.AUDIO,
  files: AttachmentType.FILE,
};

const SidebarInfoMedia: React.FC = () => {
  const { t } = useTranslation();
  const setSidebarInfo = getSetSidebarInfo();
  const activeChatId = useActiveChatId();

  const mapKeys = Object.keys(attachmentTypeMap);
  const [selectedType, setSelectedType] = useState<string>(mapKeys[0]);
  const [direction, setDirection] = useState<number>(1);

  const selectedAttachmentType = attachmentTypeMap[selectedType];
  const attachments = useActiveChatAttachments();

  const hasMoreAttachments = useHasMoreForType(
    activeChatId || "",
    selectedAttachmentType
  );

  const fetchAttachments = useAttachmentStore.getState().fetchAttachments;

  const fetchMoreAttachments =
    useAttachmentStore.getState().fetchMoreAttachments;

  const filteredAttachments = attachments.filter(
    (attachment) => attachment.type === selectedAttachmentType
  );

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

    const currentIndex = mapKeys.indexOf(selectedType);
    const newIndex = mapKeys.indexOf(type);

    setDirection(newIndex > currentIndex ? 1 : -1);
    setSelectedType(type);
  };

  const handleLoadMore = useCallback(async () => {
    if (!activeChatId) return 0;

    return fetchMoreAttachments(activeChatId, selectedAttachmentType);
  }, [activeChatId, fetchMoreAttachments, selectedAttachmentType]);

  useEffect(() => {
    if (!activeChatId) return;
    if (filteredAttachments.length === 0) {
      fetchAttachments(activeChatId, selectedAttachmentType);
    }
  }, [
    activeChatId,
    selectedAttachmentType,
    filteredAttachments.length,
    fetchAttachments,
  ]);

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
      <header className="flex p-4 w-full items-center min-h-[var(--header-height)] custom-border-b">
        <h1 className="text-xl font-semibold">
          {t("sidebar_info.media_files.title")}
        </h1>
      </header>

      <div className="flex justify-around items-center custom-border-b w-full backdrop-blur-[120px]">
        {mapKeys.map((type) => (
          <a
            key={type}
            className={getTypeClass(type)}
            onClick={() => handleTypeChange(type)}
          >
            {t(`sidebar_info.media_files.${type}`)}
          </a>
        ))}
      </div>

      <SlidingContainer uniqueKey={selectedType} direction={direction}>
        <RenderMediaAttachments
          attachments={filteredAttachments}
          selectedType={selectedType}
          onLoadMore={handleLoadMore}
          hasMore={hasMoreAttachments}
        />
      </SlidingContainer>

      <a
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-10 flex items-center justify-center cursor-pointer hover:bg-black/50 select-none"
        onClick={() => setSidebarInfo(SidebarInfoMode.DEFAULT)}
      >
        <i className="material-symbols-outlined rotate-90">arrow_forward_ios</i>
      </a>
    </aside>
  );
};

export default SidebarInfoMedia;
