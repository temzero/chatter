import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { Icon } from "./Icon";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "ghost"
  | "link";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: string; // Icon name from your icon library
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
  success: "bg-green-600 hover:bg-green-700 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  ghost: "bg-transparent hover:bg-gray-100/10 text-current",
  link: "bg-transparent hover:underline text-blue-600 p-0",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "py-1 px-3 text-sm",
  md: "py-2 px-4 text-base",
  lg: "py-3 px-6 text-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      className = "",
      disabled,
    },
    ref
  ) => {
    const baseClasses =
      "rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";
    const widthClass = fullWidth ? "w-full" : "";
    const iconOnly = icon && !children;

    return (
      <motion.button
        ref={ref}
        className={`flex items-center justify-center gap-2 ${baseClasses} ${
          variantClasses[variant]
        } ${sizeClasses[size]} ${widthClass} ${
          iconOnly ? "p-2" : ""
        } ${className}`}
        disabled={disabled || loading}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
      >
        {loading ? (
          <span className="animate-spin">
            <Icon name="refresh" size={size === "sm" ? 16 : 20} />
          </span>
        ) : (
          <>
            {icon && iconPosition === "left" && (
              <Icon name={icon} size={size === "sm" ? 16 : 20} />
            )}
            {children}
            {icon && iconPosition === "right" && (
              <Icon name={icon} size={size === "sm" ? 16 : 20} />
            )}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
