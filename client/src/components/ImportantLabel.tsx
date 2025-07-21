import React from "react";
import { motion } from "framer-motion";
import { useMessageStore } from "@/stores/messageStore";

const ImportantLabel: React.FC = () => {
  const showImportantOnly = useMessageStore((state) => state.showImportantOnly);
  const setShowImportantOnly = useMessageStore(
    (state) => state.setShowImportantOnly
  );

  if (!showImportantOnly) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="ml-2"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowImportantOnly(false);
        }}
        className="text-xs text-white font-semibold bg-red-600 p-1 rounded"
      >
        Important
      </button>
    </motion.div>
  );
};

export default React.memo(ImportantLabel);
