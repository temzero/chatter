import React from "react";
import { Logo } from "@/components/ui/icons/Logo";
import { motion } from "framer-motion";

const LoadAppErrorPage: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-red-500 text-white">
      <div className="absolute top-4 left-4 flex gap-1 items-center">
        <Logo className="h-8 w-8" />
        <h1 className="text-2xl font-semibold">Chatter</h1>
      </div>
      <motion.span
        initial={{ scale: 1.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="flex flex-col items-center justify-center gap-1"
      >
        <span className="material-symbols-outlined text-6xl">warning</span>
        <h1 className="text-lg font-medium">
          Failed to load app. Please refresh.
        </h1>
      </motion.span>
    </div>
  );
};

export default LoadAppErrorPage;
