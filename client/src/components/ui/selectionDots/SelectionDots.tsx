import React from "react";
import clsx from "clsx";

export interface SelectionDotsOption<T = string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
  preview?: React.ReactNode;
  description?: string;
}

interface SelectionDotsProps<T = string> {
  options: SelectionDotsOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  className?: string;
  variant?: "card" | "compact" | "preview";
  showPreview?: boolean;
  orientation?: "horizontal" | "vertical";
}

export const SelectionDots = <T extends string | number | symbol>({
  options,
  selected,
  onSelect,
  className,
  variant = "card",
  showPreview = false,
  orientation = "vertical",
}: SelectionDotsProps<T>) => {
  const isSelected = (value: T) => value === selected;

  const containerClasses = clsx(
    "w-full overflow-hidden",
    {
      "flex flex-col": orientation === "vertical",
      "flex gap-3": orientation === "horizontal",
      "rounded-xl custom-border": variant === "card",
    },
    className
  );

  const optionClasses = (isSelected: boolean) =>
    clsx(
      "flex items-center justify-between cursor-pointer transition-all duration-200 custom-border-b",
      {
        "p-2.5 hover:bg-(--hover-color)": variant === "card",
        "p-2 hover:bg-(--hover-color) rounded-lg": variant === "compact",
        "px-3 py-2": variant === "preview",
        "bg-(--selected-bg)": isSelected && variant === "card",
      }
    );

  return (
    <div className={containerClasses}>
      {options.map((option) => (
        <div
          key={String(option.value)}
          className={optionClasses(isSelected(option.value))}
          onClick={() => onSelect(option.value)}
        >
          {/* Left side - Radio with green dot */}
          <div className="w-full flex items-center justify-between gap-3">
            <RadioDot
              isSelected={isSelected(option.value)}
              size={variant === "compact" ? "sm" : "md"}
            />

            {/* Label and icon */}
            <div className="flex items-center gap-2">
              {option.icon && (
                <div className="w-5 h-5 flex items-center justify-center">
                  {option.icon}
                </div>
              )}
              <div>
                <span className="font-medium text-(--text-primary)">
                  {option.label}
                </span>
                {option.description && (
                  <p className="text-sm text-(--text-secondary) mt-0.5">
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Preview or additional content */}
          <div className="flex items-center">
            {showPreview && option.preview && (
              <div className="ml-4">{option.preview}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

interface RadioDotProps {
  isSelected: boolean;
  size?: "sm" | "md";
}

export const RadioDot = ({ isSelected, size = "md" }: RadioDotProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
  };

  const innerSizeClasses = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
  };

  const radioClasses = clsx(
    "rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
    sizeClasses[size],
    {
      "border-(--primary-green)": isSelected,
      "border-(--border-color)": !isSelected,
    }
  );

  return (
    <div className={radioClasses}>
      {isSelected && (
        <div
          className={`${innerSizeClasses[size]} rounded-full bg-(--primary-green-glow)`}
        />
      )}
    </div>
  );
};
