import clsx from "clsx";
import { animate, motion, useMotionValue } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface SelectionBarProps<T = string> {
  options: T[];
  selected: T;
  onSelect: (value: T) => void;
  getIcon?: (value: T) => string;
  getLabel?: (value: T) => string;
  className?: string;
}

export const SelectionBar = <T extends string>({
  options,
  selected,
  onSelect,
  getIcon,
  getLabel,
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

      // Calculate target position - should align perfectly with button (-2 to fix the position goes to the right 2px)
      const targetX = selectedIndex * calculatedButtonWidth - 2;
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

  // Reset hover state when drag starts (optional, can be removed if not needed)
  const handleDragStart = () => {
    setSliderHoveredIndex(null);
  };

  // Update button class logic to include slider hover state
  const buttonClass = (value: T, index: number) => {
    const isSelected = selected === value;
    const isSliderOver = sliderHoveredIndex === index;

    return `w-full py-1 transition-all ease-in-out ${
      isSelected || isSliderOver ? "scale-125" : "opacity-40 hover:opacity-80"
    }`;
  };

  // Handle button click - ensure exact positioning
  const handleButtonClick = (value: T, index: number) => {
    onSelect(value);
    setSliderHoveredIndex(null); // Clear any drag hover state

    // Immediately update slider position
    if (containerRef.current && sliderRef.current && buttonWidthPx > 0) {
      const targetX = index * buttonWidthPx;
      x.set(targetX);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex border-2 border-(--input-border-color) bg-(--card-bg-color) rounded-lg overflow-hidden shadow-2xl! ${className}`}
    >
      {options.map((value, index) => (
        <button
          key={value}
          className={buttonClass(value, index)}
          onClick={() => handleButtonClick(value, index)}
          style={{
            zIndex: 1,
            // Ensure button takes exact percentage width
            width: `${buttonWidthPercentage}%`,
          }}
        >
          {getIcon && (
            <i
              className={clsx(
                "material-symbols-outlined",
                value === selected && "filled"
              )}
              style={{ zIndex: 3 }}
            >
              {getIcon(value)}
            </i>
          )}

          {getLabel && <span className="truncate">{getLabel(value)}</span>}
        </button>
      ))}
      <motion.div
        ref={sliderRef}
        id="slider"
        className="absolute bg-(--primary-green)/40 h-full rounded cursor-pointer active:cursor-grabbing"
        style={{
          zIndex: 2,
          x,
          // Set initial width to prevent flash
          width:
            buttonWidthPx > 0
              ? `${buttonWidthPx}px`
              : `${100 / options.length}%`,
        }}
        drag="x"
        // dragConstraints={containerRef}
        dragElastic={0}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      />
    </div>
  );
};
