import clsx from "clsx";

interface SelectionBarProps<T = string> {
  options: T[];
  selected: T;
  onSelect: (value: T) => void;
  getIcon?: (value: T) => string;
  getClassName?: (value: T, selected: T) => string;
}

export const SelectionBar = <T extends string>({
  options,
  selected,
  onSelect,
  getIcon,
  getClassName,
}: SelectionBarProps<T>) => {
  const defaultClass = (value: T) =>
    `w-full ${
      selected === value
        ? "bg-(--primary-green) text-white"
        : "opacity-40 hover:opacity-80"
    }`;

  return (
    <div className="flex m-2 border-2 border-(--border-color) bg-(--card-bg-color) rounded-lg overflow-hidden shadow-xl">
      {options.map((value) => (
        <button
          key={value}
          className={
            getClassName ? getClassName(value, selected) : defaultClass(value)
          }
          onClick={() => onSelect(value)}
        >
          {getIcon && (
            <i
              className={clsx(
                "material-symbols-outlined",
                value === selected && "filled",
                // optional example for GROUP type icon size adjustment
                value === "group" && "text-[2.1rem]!"
              )}
            >
              {getIcon(value)}
            </i>
          )}
        </button>
      ))}
    </div>
  );
};
