import { useRef, useEffect, useState, useCallback } from "react";
import { useIsCompactSidebar } from "@/stores/sidebarStore";
import { type ColorPreset } from "@/common/constants/folderColor";

export type SelectorItem = {
  id: string;
  name?: string;
  icon?: string;
  color?: ColorPreset | string; // Accept both ColorPreset and custom strings
};

type Props<T extends SelectorItem> = {
  items: readonly T[];
  selected: T;
  onSelect: (item: T) => void;
};

const HorizontalSelector = <T extends SelectorItem>({
  items,
  selected,
  onSelect,
}: Props<T>) => {
  const isCompact = useIsCompactSidebar();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const MARGIN = 4;
    setCanScrollLeft(el.scrollLeft > MARGIN);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - MARGIN);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollButtons();
    const ro = new ResizeObserver(updateScrollButtons);

    el.addEventListener("scroll", updateScrollButtons);
    ro.observe(el);

    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", updateScrollButtons);
    };
  }, [updateScrollButtons]);

  const getClass = (id: string) =>
    `flex items-center justify-center cursor-pointer p-2 px-2.5 whitespace-nowrap hover:opacity-80 ${
      selected.id === id ? "opacity-100 font-bold border-b-3" : ""
    }`;

  const buttonBaseClass =
    "group absolute h-full flex items-center justify-center bg-(--sidebar-color) custom-border overflow-hidden cursor-pointer";
  const buttonIconClass =
    "material-symbols-outlined opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all";

  return (
    <div className="relative w-full flex items-center custom-border-t custom-border-b select-none no-scrollbar!">
      <div
        ref={scrollRef}
        className="flex items-center overflow-x-auto no-scrollbar scrollbar-hide"
      >
        {(isCompact ? [selected] : items).map((item) => (
          <a
            key={item.id}
            className={getClass(item.id)}
            onClick={() => onSelect(item)}
            style={{
              borderColor: item.color || undefined,
              color: item.color || undefined,
            }}
          >
            {item.icon ? (
              <span className="material-symbols-outlined">{item.icon}</span>
            ) : (
              item.name
            )}
          </a>
        ))}
      </div>

      {!isCompact && canScrollLeft && (
        <div
          onClick={() =>
            scrollRef.current?.scrollBy({ left: -250, behavior: "smooth" })
          }
          className={buttonBaseClass + " left-0"}
        >
          <i className={buttonIconClass + " rotate-180"}>arrow_forward_ios</i>
        </div>
      )}

      {!isCompact && canScrollRight && (
        <div
          onClick={() =>
            scrollRef.current?.scrollBy({ left: 250, behavior: "smooth" })
          }
          className={buttonBaseClass + " right-0"}
        >
          <i className={buttonIconClass}>arrow_forward_ios</i>
        </div>
      )}
    </div>
  );
};

export default HorizontalSelector;
