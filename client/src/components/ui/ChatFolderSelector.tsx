import React, { useRef, useEffect, useState, useCallback } from "react";
import { useFolderStore } from "@/stores/folderStore";
import { useSidebarStore } from "@/stores/sidebarStore";

type Props = {
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
  chatFolders: string[];
};

const ChatFolderSelector: React.FC<Props> = ({
  selectedFolder,
  onSelectFolder,
  chatFolders,
}) => {
  const { folders } = useFolderStore();
  const isCompact = useSidebarStore((state) => state.isCompact);

  const scrollRef = useRef<HTMLDivElement>(null);
  const canScrollLeftRef = useRef(false);
  const canScrollRightRef = useRef(false);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Add "All" to the beginning of the folders list
  const allFolders = ["All", ...chatFolders];

  const getFolderClass = useCallback(
    (folder: string) =>
      `flex items-center justify-center cursor-pointer font-semibold p-2 px-2.5 whitespace-nowrap ${
        selectedFolder === folder
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

  if (!allFolders.length) return <div className="custom-border"></div>;

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  return (
    <div className="relative px-2 flex items-center justify-center w-full custom-border-t custom-border-b shadow select-none">
      <div
        ref={scrollRef}
        className="flex items-center overflow-x-auto no-scrollbar scrollbar-hide"
      >
        {isCompact ? (
          <a className={getFolderClass(selectedFolder)}>
            {selectedFolder.charAt(0).toUpperCase() + selectedFolder.slice(1)}
          </a>
        ) : (
          allFolders.map((folderName) => {
            const folder = folders.find((f) => f.name === folderName);

            return (
              <a
                key={folderName}
                className={getFolderClass(folderName)}
                onClick={() => onSelectFolder(folderName)}
                style={
                  folder?.color
                    ? { color: folder.color, borderColor: folder.color }
                    : {}
                }
              >
                {folderName.charAt(0).toUpperCase() + folderName.slice(1)}
              </a>
            );
          })
        )}
      </div>

      {!isCompact && canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="bg-[input-border-color] custom-border-r shadow-lg backdrop-blur-sm rounded-none flex items-center justify-center overflow-hidden h-full w-6 absolute left-0 top-0 z-40 select-none"
        >
          <i className="material-symbols-outlined text-sm font-bold pl-1.5">
            arrow_back_ios
          </i>
        </button>
      )}

      {!isCompact && canScrollRight && (
        <button
          onClick={scrollRight}
          className="bg-[input-border-color] custom-border-l shadow-lg backdrop-blur-sm rounded-none flex items-center justify-center overflow-hidden h-full w-6 absolute right-0 top-0 z-40 select-none"
        >
          <i className="material-symbols-outlined text-sm font-bold pl-0.5">
            arrow_forward_ios
          </i>
        </button>
      )}
    </div>
  );
};

export default ChatFolderSelector;
