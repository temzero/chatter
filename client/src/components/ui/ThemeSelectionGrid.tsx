// SelectionGrid.tsx
import React from "react";
import clsx from "clsx";

interface SelectionGridProps<T extends { id: string | null; name: string }> {
  items: T[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  renderItemBackground: (item: T) => React.ReactNode;
  columns?: number;
  className?: string;
}

export const SelectionGrid = <T extends { id: string | null; name: string }>({
  items,
  selectedId,
  onSelect,
  renderItemBackground,
  columns = 3,
  className = "",
}: SelectionGridProps<T>) => {
  return (
    <div
      className={`grid gap-3 overflow-auto mb-6 ${className}`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {items.map((item) => (
        <SelectionGridItem
          key={item.id || "none"}
          item={item}
          isSelected={selectedId === item.id}
          onSelect={onSelect}
          renderBackground={() => renderItemBackground(item)}
          isRound={item.id === null}
          showCheckmark={item.id !== null}
        />
      ))}
    </div>
  );
};

// SelectionGridItem.tsx

interface SelectionGridItemProps<
  T extends { id: string | null; name: string }
> {
  item: T;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  renderBackground: () => React.ReactNode;
  isRound?: boolean;
  showCheckmark?: boolean;
  className?: string;
}

export const SelectionGridItem = <
  T extends { id: string | null; name: string }
>({
  item,
  isSelected,
  onSelect,
  renderBackground,
  isRound = false,
  showCheckmark = true,
  className = "",
}: SelectionGridItemProps<T>) => {
  const isNullItem = item.id === null;
  const isNullSelected = isSelected && isNullItem;

  return (
    <button
      onClick={() => onSelect(item.id)}
      className={clsx(
        "relative aspect-square border-2 transition-all hover:scale-90 overflow-hidden",
        // ===== Selected border =====
        isSelected && !isNullItem && "border-(--primary-green-glow)! border-4",
        isNullSelected && "border-red-500! border-4",
        !isSelected && "hover:border-4",
        {
          "rounded-full! border-(--input-border-color)!": isRound || isNullItem,
          "rounded-lg! border-(--border-color)!": !isRound && !isNullItem,
        },
        className
      )}
      title={item.name}
    >
      {/* Background */}
      {renderBackground()}

      {/* Diagonal line for null items */}
      {isNullItem && (
        <div
          style={{ zIndex: 1 }}
          className="pointer-events-none absolute inset-0"
        >
          <div
            className={clsx(
              "absolute top-1/2 left-[-25%] w-[150%] -rotate-45",
              isNullSelected ? "bg-red-500 h-1" : "bg-(--input-border-color) h-0.5"
            )}
          />
        </div>
      )}

      {/* Checkmark for selected non-null items */}
      {isSelected && !isNullItem && showCheckmark && (
        <div className="absolute bottom-1 right-1 z-10">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-(--primary-green) shadow-md">
            <span className="material-symbols-outlined text-white">check</span>
          </div>
        </div>
      )}
    </button>
  );
};
