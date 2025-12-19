import React, { useState, useCallback, useEffect } from "react";
import { getSetSidebarInfo } from "@/stores/sidebarInfoStore";
import { SlidingContainer } from "@/components/ui/layout/SlidingContainer";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";
import { useTranslation } from "react-i18next";
import {
  useActiveChatAttachments,
  useAttachmentStore,
  useHasMoreForType,
} from "@/stores/messageAttachmentStore";
import { useActiveChatId } from "@/stores/chatStore";
import RenderMediaAttachments from "./RenderMediaAttachments";
import AttachmentSelector from "./AttachmentSelector";
import { SidebarInfoAttachmentTypes } from "@/common/constants/sidebarInfoAttachmentTypes";

const SidebarInfoAttachments: React.FC = () => {
  const { t } = useTranslation();
  const setSidebarInfo = getSetSidebarInfo();
  const activeChatId = useActiveChatId();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const selectedAttachmentType = SidebarInfoAttachmentTypes[selectedIndex];
  const attachments = useActiveChatAttachments();

  // Track hasMore per type
  const hasMoreAttachments = useHasMoreForType(
    activeChatId || "",
    selectedAttachmentType
  );

  const fetchAttachments = useAttachmentStore.getState().fetchAttachments;

  // Filter attachments for the selected type
  const filteredAttachments = attachments.filter(
    (attachment) => attachment.type === selectedAttachmentType
  );

  const handleLoadMore = useCallback(async () => {
    if (!activeChatId) return 0;
    return fetchAttachments(activeChatId, selectedAttachmentType, true);
  }, [activeChatId, selectedAttachmentType, fetchAttachments]);

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
      <header className="flex p-4 w-full items-center min-h-(--header-height) custom-border-b">
        <h1 className="text-xl font-semibold">
          {t("sidebar_info.media_files.title")}
        </h1>
      </header>

      <AttachmentSelector
        selectedType={selectedAttachmentType}
        onSelectType={(type) => {
          const index = SidebarInfoAttachmentTypes.indexOf(type);
          if (index === selectedIndex) return;

          setDirection(index > selectedIndex ? 1 : -1);
          setSelectedIndex(index);
        }}
      />

      <SlidingContainer uniqueKey={selectedIndex} direction={direction}>
        <RenderMediaAttachments
          attachments={filteredAttachments}
          selectedType={SidebarInfoAttachmentTypes[selectedIndex]}
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

export default SidebarInfoAttachments;
