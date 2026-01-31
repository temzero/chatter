import { motion, AnimatePresence } from "framer-motion";

interface OnlineDotProps {
  isOnline: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export const OnlineDot = ({
  isOnline,
  size = "sm",
  className = "",
}: OnlineDotProps) => {
  const sizeClasses = {
    xs: "w-1 h-1",
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  return (
    <AnimatePresence>
      {isOnline && (
        <motion.div
          key="online-dot"
          initial={{ scale: 2 }}
          animate={{ scale: 1 }}
          className={`rounded-full! bg-green-500 border border-(--panel-color) ${sizeClasses[size]} ${className}`}
        />
      )}
    </AnimatePresence>
  );
};
