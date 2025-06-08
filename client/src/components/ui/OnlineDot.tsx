interface OnlineDotProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const OnlineDot = ({
  isOnline,
  size = "md",
  className = "",
}: OnlineDotProps) => {
  if (!isOnline) return null;

  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <div
      className={`rounded-full custom-border shadow-sm bg-green-500 ${sizeClasses[size]} ${className}`}
    />
  );
};
