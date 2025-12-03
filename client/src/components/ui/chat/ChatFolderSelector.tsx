import React, { useRef, useEffect, useState, useCallback } from "react";
import { useIsCompactSidebar } from "@/stores/sidebarStore";
import { FolderResponse } from "@/shared/types/responses/folder.response";

type Props = {
  selectedFolder: FolderResponse;
  onSelectFolder: (folder: FolderResponse) => void;
  folders: FolderResponse[]; // This now includes "all" as the first item
};

const ChatFolderSelector: React.FC<Props> = ({
  selectedFolder,
  onSelectFolder,
  folders,
}) => {
  console.log("[MOUNTED]", "ChatFolderSelector");
  const isCompact = useIsCompactSidebar();

  const scrollRef = useRef<HTMLDivElement>(null);
  const canScrollLeftRef = useRef(false);
  const canScrollRightRef = useRef(false);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const getFolderClass = useCallback(
    (folderId: string) =>
      `flex items-center justify-center cursor-pointer font-semibold p-2 px-2.5 whitespace-nowrap ${
        selectedFolder.id === folderId
          ? "opacity-100 font-bold border-b-2"
          : "opacity-70 hover:opacity-100"
      }`,
    [selectedFolder]
  );

  const updateScrollButtons = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const SCROLL_MARGIN = 4;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    const newCanScrollLeft = scrollLeft > SCROLL_MARGIN;
    const newCanScrollRight =
      scrollLeft < scrollWidth - clientWidth - SCROLL_MARGIN;

    if (canScrollLeftRef.current !== newCanScrollLeft) {
      canScrollLeftRef.current = newCanScrollLeft;
      setCanScrollLeft(newCanScrollLeft);
    }

    if (canScrollRightRef.current !== newCanScrollRight) {
      canScrollRightRef.current = newCanScrollRight;
      setCanScrollRight(newCanScrollRight);
    }
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    updateScrollButtons();

    const resizeObserver = new ResizeObserver(updateScrollButtons);
    const handleScroll = () => updateScrollButtons();
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollBy({ left: e.deltaY * 3, behavior: "smooth" });
      }
    };

    resizeObserver.observe(container);
    container.addEventListener("scroll", handleScroll);
    container.addEventListener("wheel", handleWheel, { passive: false });

    const timer = setTimeout(updateScrollButtons, 50);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("wheel", handleWheel);
    };
  }, [updateScrollButtons]);

  if (!folders.length) return <div className="custom-border" />;

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  return (
    <div className="w-full relative px-2 flex items-center custom-border-t custom-border-b shadow select-none">
      <div
        ref={scrollRef}
        className="flex items-center overflow-x-auto no-scrollbar scrollbar-hide"
      >
        {isCompact ? (
          <a
            className={getFolderClass(selectedFolder.id)}
            style={
              selectedFolder.color
                ? {
                    color: selectedFolder.color,
                    borderColor: selectedFolder.color,
                  }
                : {}
            }
          >
            {selectedFolder.name.charAt(0).toUpperCase() +
              selectedFolder.name.slice(1)}
          </a>
        ) : (
          folders.map((folder) => (
            <a
              key={folder.id}
              className={getFolderClass(folder.id)}
              onClick={() => onSelectFolder(folder)}
              style={
                folder.color
                  ? { color: folder.color, borderColor: folder.color }
                  : {}
              }
            >
              {folder.name.charAt(0).toUpperCase() + folder.name.slice(1)}
            </a>
          ))
        )}
      </div>

      {!isCompact && canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="bg-(--input-border-color) custom-border-r shadow-lg backdrop-blur-sm rounded-none flex items-center justify-center overflow-hidden h-full w-6 absolute left-0 top-0 select-none"
          style={{ zIndex: 10 }}
        >
          <i className="material-symbols-outlined text-sm! font-bold pl-1.5">
            arrow_back_ios
          </i>
        </button>
      )}

      {!isCompact && canScrollRight && (
        <button
          onClick={scrollRight}
          className="bg-(--input-border-color) custom-border-l shadow-lg backdrop-blur-sm rounded-none flex items-center justify-center overflow-hidden h-full w-6 absolute right-0 top-0 select-none"
          style={{ zIndex: 10 }}
        >
          <i className="material-symbols-outlined text-sm! font-bold pl-0.5">
            arrow_forward_ios
          </i>
        </button>
      )}
    </div>
  );
};

export default ChatFolderSelector;
