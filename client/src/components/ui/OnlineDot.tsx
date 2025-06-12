import { motion, AnimatePresence } from "framer-motion";

interface OnlineDotProps {
  isOnline: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export const OnlineDot = ({
  isOnline,
  size = "xs",
  className = "",
}: OnlineDotProps) => {
  const sizeClasses = {
    xs: "w-1 h-1",
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <AnimatePresence>
      {isOnline && (
        <motion.div
          key="online-dot"
          initial={{ scale: 2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`rounded-full bg-green-500 ${sizeClasses[size]} ${className}`}
        />
      )}
    </AnimatePresence>
  );
};
