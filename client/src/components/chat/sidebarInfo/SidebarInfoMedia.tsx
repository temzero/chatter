import React, { useState, useMemo } from "react";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { useActiveChatAttachments } from "@/stores/messageStore";
import { SlidingContainer } from "@/components/ui/SlidingContainer";
import { AttachmentType } from "@/types/enums/attachmentType";
import RenderAttachment from "@/components/ui/RenderAttachment";
import clsx from "clsx";

const mediaTypes = ["images", "videos", "audio", "files"];

const ChatInfoMedia: React.FC = () => {
  const setSidebarInfo = useSidebarInfoStore((state) => state.setSidebarInfo);
  const activeAttachments = useActiveChatAttachments();

  const [selectedType, setSelectedType] = useState<string>(mediaTypes[0]);
  const [direction, setDirection] = useState<number>(1);

  // Filter media by type
  const filteredMedia = useMemo(() => {
    return activeAttachments.filter((attachment) => {
      switch (selectedType) {
        case "images":
          return attachment.type === AttachmentType.IMAGE;
        case "videos":
          return attachment.type === AttachmentType.VIDEO;
        case "audio":
          return attachment.type === AttachmentType.AUDIO;
        case "files":
          return attachment.type === AttachmentType.FILE;
        default:
          return false;
      }
    });
  }, [activeAttachments, selectedType]);

  const getTypeClass = React.useCallback(
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

  const renderMediaContent = () => {
    if (filteredMedia.length === 0) {
      return (
        <div className="flex justify-center items-center h-32 opacity-50">
          No {selectedType} available
        </div>
      );
    }

    return (
      <div
        className={clsx(
          "border-4",
          selectedType === "files" || selectedType === "audio"
            ? "flex flex-col"
            : "grid grid-cols-3 pb-10"
        )}
      >
        {filteredMedia.map((media, index) => (
          <div
            key={`${media.messageId}-${index}`}
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
        <h1 className="text-xl font-semibold">Media & Files</h1>
        <a
          className="flex items-center rounded-full cursor-pointer opacity-50 hover:opacity-100 ml-auto"
          onClick={() => setSidebarInfo("default")}
        >
          <i className="material-symbols-outlined">edit</i>
        </a>
      </header>

      <div className="flex justify-around items-center custom-border-b w-full backdrop-blur-[120px]">
        {mediaTypes.map((type) => (
          <a
            key={type}
            className={getTypeClass(type)}
            onClick={() => handleTypeChange(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </a>
        ))}
      </div>

      <div className="overflow-x-hidden overflow-y-auto h-screen">
        <SlidingContainer uniqueKey={selectedType} direction={direction}>
          {renderMediaContent()}
        </SlidingContainer>
      </div>

      <a
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-10 flex items-center justify-center cursor-pointer opacity-50 hover:opacity-90 bg-[var(--sidebar-color)]"
        onClick={() => setSidebarInfo("default")}
      >
        <i className="material-symbols-outlined rotate-90">arrow_forward_ios</i>
      </a>
    </aside>
  );
};

export default ChatInfoMedia;
