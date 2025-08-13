// components/ui/calling/CallCallingUI.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BounceLoader } from "react-spinners";
import { useCallStore } from "@/stores/callStore";
import { CallHeader } from "./components/CallHeader";

interface CallCallingUIProps {
  onCancel: () => void;
}

export const CallCallingUI: React.FC<CallCallingUIProps> = ({ onCancel }) => {
  const { chat, isVideoCall, switchType } = useCallStore();
  const [localIsVideoCall, setLocalIsVideoCall] = useState(isVideoCall);

  if (!chat) return null;

  const handleSwitchCallType = () => {
    setLocalIsVideoCall((prev) => !prev);
    switchType();
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-full z-20">
      {/* Avatar Section */}
      <CallHeader chat={chat} />

      {/* Calling Content */}
      <div className="flex flex-col justify-center items-center gap-4 py-10 select-none relative">
        <motion.button
          title={`Switch To ${localIsVideoCall ? "Voice" : "Video"} Call`}
          onClick={handleSwitchCallType}
          className="p-4 rounded-full hover:bg-[--primary-green] transition-colors relative hover:custom-border"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={localIsVideoCall ? "videocam" : "call"}
              className="material-symbols-outlined text-6xl flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.1 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {localIsVideoCall ? "videocam" : "call"}
            </motion.span>
          </AnimatePresence>
        </motion.button>

        {/* Loader */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 z-0">
          <BounceLoader color="#8b8b8b" size={500} />
        </div>
        {/* <span className="mt-4 text-gray-400 text-sm">Calling...</span> */}
      </div>

      {/* Cancel Button */}
      <div className="flex gap-4 mt-4">
        <motion.button
          onClick={onCancel}
          className="bg-red-500 px-6 py-2 rounded-full text-white"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Cancel
        </motion.button>
      </div>
    </div>
  );
};
