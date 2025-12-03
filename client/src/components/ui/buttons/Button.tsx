import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/icons/Icon";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "transparent"
  | "success"
  | "danger"
  | "ghost"
  | "link"
  | "outline";

type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: string; // Icon name from your icon library
  isIconFilled?: boolean;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  isRoundedFull?: boolean; // Optional prop for full rounded corners
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-(--primary-green) hover:bg-(--primary-green-glow) text-white",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
  transparent: "bg-(--input-border-color) hover:bg-gray-300 text-gray-800",
  success: "bg-(--primary-green) hover:bg-(--primary-green-50) text-white",
  danger: "bg-red-500 hover:bg-red-600 text-white",
  ghost: "bg-transparent hover:bg-gray-100/10 text-current",
  link: "bg-transparent hover:underline text-blue-600 p-0",
  outline:
    "bg-transparent border border-gray-400 text-gray-800 hover:bg-gray-100 hover:border-gray-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "py-1 px-3 text-sm",
  md: "py-2 px-4 text-md",
  lg: "py-2 px-4 text-lg",
  xl: "py-3 px-6 text-xl",
};

const iconSizeMap: Record<ButtonSize, number> = {
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      isIconFilled = false,
      iconPosition = "left",
      fullWidth = false,
      isRoundedFull = false,
      className = "",
      disabled,
      onClick,
    },
    ref
  ) => {
    const baseClasses =
      "font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    const widthClass = fullWidth ? "w-full" : "";
    const iconOnly = icon && !children;
    const roundedClass = isRoundedFull ? "rounded-full" : "rounded-md";
    const iconSize = iconSizeMap[size];

    return (
      <motion.button
        ref={ref}
        className={`flex items-center justify-center gap-2 select-none ${baseClasses} ${roundedClass} ${
          variantClasses[variant]
        } ${sizeClasses[size]} ${widthClass} ${
          iconOnly ? "p-2" : ""
        } ${className}`}
        disabled={disabled || loading}
        whileTap={{ scale: disabled ? 1 : 0.96 }}
        onClick={onClick}
      >
        {loading ? (
          <span className="animate-spin">
            <Icon name="refresh" isFilled={isIconFilled} size={iconSize} />
          </span>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <Icon name={icon} isFilled={isIconFilled} size={iconSize} />
            )}
            {children}
            {icon && iconPosition === "right" && (
              <Icon name={icon} isFilled={isIconFilled} size={iconSize} />
            )}
          </>
        )}
      </motion.button>
    );
  }
);

export default Button;
