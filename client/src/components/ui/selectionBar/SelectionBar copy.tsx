// components/ui/selectionBar/SelectionBar.tsx
import clsx from "clsx";
import { animate, motion, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface SelectionBarProps<T = string> {
  options: T[];
  selected: T;
  onSelect: (value: T) => void;
  getIcon?: (value: T) => string;
  getLabel?: (value: T) => string;
  getFontClass?: (value: T) => string; // Apply font class if provided
  getTextSize?: (value: T) => string; // Apply text size if provided
  className?: string;
}

export const SelectionBar = <T extends string>({
  options,
  selected,
  onSelect,
  getIcon,
  getLabel,
  getFontClass,
  getTextSize,
  className,
}: SelectionBarProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Motion values for drag
  const x = useMotionValue(0);

  // Track which option is currently hovered by the slider (during drag)
  const [sliderHoveredIndex, setSliderHoveredIndex] = useState<number | null>(
    null
  );

  // Store button width in state to use in drag calculations
  const [buttonWidthPx, setButtonWidthPx] = useState<number>(0);

  // Dynamically calculate button width (percentage)
  const buttonWidthPercentage = 100 / options.length;

  // Find index of selected option
  const selectedIndex = options.indexOf(selected);

  // Calculate target position and slider width
  useEffect(() => {
    if (containerRef.current && sliderRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const calculatedButtonWidth =
        (buttonWidthPercentage * containerWidth) / 100;
      setButtonWidthPx(calculatedButtonWidth);

      // Set slider width to button width
      sliderRef.current.style.width = `${calculatedButtonWidth}px`;

      // Calculate target position - should align perfectly with button
      const targetX = selectedIndex * calculatedButtonWidth;
      x.set(targetX);
    }
  }, [selected, selectedIndex, buttonWidthPercentage, x]);

  const handleDrag = () => {
    if (!containerRef.current || buttonWidthPx === 0) return;

    const containerWidth = containerRef.current.offsetWidth;
    const currentX = x.get();

    const overshoot = buttonWidthPx * 0.3;

    const minX = -overshoot;
    const maxX = containerWidth - buttonWidthPx + overshoot;

    if (currentX < minX) x.set(minX);
    if (currentX > maxX) x.set(maxX);

    const hoveredIndex = Math.floor(
      (Math.max(0, Math.min(currentX, containerWidth - buttonWidthPx)) +
        buttonWidthPx / 2) /
        buttonWidthPx
    );

    setSliderHoveredIndex(
      Math.max(0, Math.min(hoveredIndex, options.length - 1))
    );
  };

  const handleDragEnd = () => {
    if (buttonWidthPx === 0) return;

    const currentX = x.get();

    const closestIndex = Math.round(currentX / buttonWidthPx);
    const boundedIndex = Math.max(
      0,
      Math.min(closestIndex, options.length - 1)
    );

    onSelect(options[boundedIndex]);
    setSliderHoveredIndex(null);

    const targetX = boundedIndex * buttonWidthPx;

    animate(x, targetX, {
      type: "spring",
      stiffness: 500,
      damping: 30,
    });
  };

  const handleDragStart = () => {
    setSliderHoveredIndex(null);
  };

  const buttonClass = (value: T, index: number) => {
    const isSelected = selected === value;
    const isSliderOver = sliderHoveredIndex === index;

    return `transition-all ease-in-out ${
      isSelected || isSliderOver ? "scale-110" : "opacity-60 hover:opacity-90"
    }`;
  };

  const handleButtonClick = (value: T, index: number) => {
    onSelect(value);
    setSliderHoveredIndex(null);

    if (containerRef.current && sliderRef.current && buttonWidthPx > 0) {
      const targetX = index * buttonWidthPx;
      x.set(targetX);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative min-h-10 flex items-center justify-between border-2 border-(--input-border-color) bg-(--card-bg-color) rounded-lg overflow-hidden shadow-lg ${className}`}
    >
      {options.map((value, index) => {
        const fontClass = getFontClass ? getFontClass(value) : "";
        const textSize = getTextSize ? getTextSize(value) : "";
        
        return (
          <button
            key={value}
            className={buttonClass(value, index)}
            onClick={() => handleButtonClick(value, index)}
            style={{
              zIndex: 1,
              width: `${buttonWidthPercentage}%`,
              height: "100%"
            }}
          >
            <div className="flex flex-col items-center justify-center gap-1">
              {getIcon && (
                <i
                  className={clsx(
                    "material-symbols-outlined",
                    value === selected && "filled",
                    fontClass,
                    textSize
                  )}
                >
                  {getIcon(value)}
                </i>
              )}

              {getLabel && (
                <span 
                  className={clsx(
                    "truncate text-center px-1",
                    fontClass,  // Apply font class if provided
                    textSize    // Apply text size if provided
                  )}
                >
                  {getLabel(value)}
                </span>
              )}
            </div>
          </button>
        );
      })}
      <motion.div
        ref={sliderRef}
        id="slider"
        className="absolute bg-(--primary-green)/30 h-full rounded cursor-pointer active:cursor-grabbing"
        style={{
          zIndex: 2,
          x,
          width:
            buttonWidthPx > 0
              ? `${buttonWidthPx}px`
              : `${100 / options.length}%`,
        }}
        drag="x"
        dragElastic={0}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      />
    </div>
  );
};