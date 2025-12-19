// components/common/HorizontalSelector.tsx
import { useRef, useEffect, useState, useCallback } from "react";
import { useIsCompactSidebar } from "@/stores/sidebarStore";

export type SelectorItem = {
  id: string;
  name: string;
  color?: string;
};

type Props<T extends SelectorItem> = {
  items: T[];
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
    `flex items-center justify-center cursor-pointer p-2 px-2.5 whitespace-nowrap ${
      selected.id === id
        ? "opacity-100 font-bold border-b-2"
        : "opacity-70 hover:opacity-100"
    }`;

  const buttonBaseClass =
    "absolute h-full flex items-center justify-center bg-(--sidebar-color) custom-border overflow-hidden cursor-pointer";

  return (
    <div className="relative w-full flex items-center px-2 custom-border-b select-none  no-scrollbar!">
      <div
        ref={scrollRef}
        className="flex items-center overflow-x-auto no-scrollbar scrollbar-hide"
      >
        {(isCompact ? [selected] : items).map((item) => (
          <a
            key={item.id}
            className={getClass(item.id)}
            onClick={() => onSelect(item)}
            style={
              item.color ? { color: item.color, borderColor: item.color } : {}
            }
          >
            {item.name}
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
          <i className="material-symbols-outlined rotate-180  hover:scale-125 text-(--primary-green) transition-all">arrow_forward_ios</i>
        </div>
      )}

      {!isCompact && canScrollRight && (
        <div
          onClick={() =>
            scrollRef.current?.scrollBy({ left: 250, behavior: "smooth" })
          }
          className={buttonBaseClass + " right-0"}
        >
          <i className="material-symbols-outlined text-xs hover:scale-125 text-(--primary-green) transition-all">arrow_forward_ios</i>
        </div>
      )}
    </div>
  );
};

export default HorizontalSelector;
