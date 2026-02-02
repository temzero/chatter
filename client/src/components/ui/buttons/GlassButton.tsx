// GlassButton.tsx
import clsx from "clsx";
import { SizeEnum } from "../../../shared/types/enums/size.enum";

interface GlassButtonProps {
  icon?: string; // Material icon name
  reversedIcon?: string; // Material icon name
  text?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onContextMenu?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  size?: SizeEnum;
  active?: boolean;
}

const GlassButton: React.FC<GlassButtonProps> = ({
  icon,
  reversedIcon,
  text,
  onClick,
  onContextMenu,
  className = "",
  size = SizeEnum.M,
  active = false,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onClick?.(e);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onContextMenu?.(e);
  };

  // Size values mapping to CSS variables
  const sizeValues: Record<SizeEnum, string> = {
    [SizeEnum.XS]: "var(--glass-button-height-xs, 32px)",
    [SizeEnum.S]: "var(--glass-button-height-s, 38px)",
    [SizeEnum.M]: "var(--glass-button-height-m, 40px)",
    [SizeEnum.L]: "var(--glass-button-height-l, 44px)",
    [SizeEnum.XL]: "var(--glass-button-height-xl, 48px)",
    [SizeEnum.XXL]: "var(--glass-button-height-xl, 56px)",
  };

  // Determine if button has text (either as prop or in children)
  const hasOnlyOneIcon = Boolean(
    (icon && !reversedIcon && !text) || (!icon && reversedIcon && !text),
  );

  return (
    <button
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={clsx(
        "glass-button",
        {
          active: active,
        },
        className,
      )}
      style={{
        // If only one icon, make it square (for perfect circle)
        width: hasOnlyOneIcon ? sizeValues[size] : "auto",
        height: sizeValues[size],
        minWidth: hasOnlyOneIcon ? sizeValues[size] : sizeValues[size],
        minHeight: sizeValues[size],
        paddingLeft: hasOnlyOneIcon ? 0 : "1rem",
        paddingRight: hasOnlyOneIcon ? 0 : "1rem",
      }}
    >
      <div className="w-full h-full flex gap-2 items-center justify-center">
        {icon && (
          <i className="material-symbols-outlined filled text-3xl!">{icon}</i>
        )}
        {text && <span>{text}</span>}

        {reversedIcon && (
          <i className="material-symbols-outlined filled text-3xl! -scale-x-100">
            {reversedIcon}
          </i>
        )}
      </div>
    </button>
  );
};

export default GlassButton;
