// GlassButton.tsx
import clsx from "clsx";
import { SizeEnum } from "../../../shared/types/enums/size.enum";

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onContextMenu?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  size?: SizeEnum;
  active?: boolean;
}

const GlassButton: React.FC<GlassButtonProps> = ({
  children,
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
    [SizeEnum.S]: "var(--glass-button-height-s, 36px)",
    [SizeEnum.M]: "var(--glass-button-height-m, 40px)",
    [SizeEnum.L]: "var(--glass-button-height-l, 44px)",
    [SizeEnum.XL]: "var(--glass-button-height-xl, 48px)",
    [SizeEnum.XXL]: "var(--glass-button-height-xl, 56px)",
  };

  return (
    <button
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      className={clsx("glass-button", { active: active }, className)}
      style={{
        width: sizeValues[size],
        height: sizeValues[size],
        minWidth: sizeValues[size],
        minHeight: sizeValues[size],
      }}
    >
      {children}
    </button>
  );
};

export default GlassButton;
