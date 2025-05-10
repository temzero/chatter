type AvatarProps = {
  avatar: string;
  size?: "sm" | "md" | "lg" | "xl"; // Simplified size options
  className?: string;
};

export const Avatar: React.FC<AvatarProps> = ({
  avatar,
  size = "md",
  className = "",
}) => {
  // Define size styles
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          dimension: "h-8 w-8 min-w-[2rem] min-h-[2rem]",
          iconSize: "text-sm",
          fallbackIconSize: "text-3xl",
        };
      case "lg":
        return {
          dimension: "h-12 w-12 min-w-[3rem] min-h-[3rem]",
          iconSize: "text-xl",
          fallbackIconSize: "text-3xl",
        };
      case "xl":
        return {
          dimension: "h-16 w-16 min-w-[4rem] min-h-[4rem]",
          iconSize: "text-2xl",
          fallbackIconSize: "text-4xl",
        };
      case "md":
      default:
        return {
          dimension: "h-10 w-10 min-w-[2.5rem] min-h-[2.5rem]",
          iconSize: "text-lg",
          fallbackIconSize: "text-3xl",
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const baseClasses = `flex items-center justify-center overflow-hidden rounded-full border-2 border-[var(--border-color)] ${sizeStyles.dimension} ${className}`;

  return (
    <div className={`bg-[var(--bg-secondary)] ${baseClasses}`}>
      {avatar ? (
        <img
          className="h-full w-full object-cover"
          src={avatar}
          loading="lazy"
        />
      ) : (
        <i
          className={`material-symbols-outlined ${sizeStyles.fallbackIconSize} opacity-20 flex items-center justify-center`}
        >
          mood
        </i>
      )}
    </div>
  );
};
