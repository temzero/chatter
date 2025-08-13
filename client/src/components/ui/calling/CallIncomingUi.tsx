import { ChatResponse } from "@/types/responses/chat.response";
import { motion, AnimatePresence } from "framer-motion";
import { CallHeader } from "./components/CallHeader";

export const CallIncomingUI = ({
  chat,
  onAccept,
  onReject,
}: {
  chat: ChatResponse;
  onAccept: () => void;
  onReject: () => void;
  isGroupCall?: boolean;
  participants?: Array<{ id: string; avatar: string; name: string }>;
}) => {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Header with avatar */}
      <div id="calling-title" className="flex flex-col items-center z-20">
        {/* Avatar Section */}
        <CallHeader chat={chat} />
        {/* Title */}
        <p className="text-sm text-gray-400 mt-1">Incoming call</p>
      </div>

      {/* calling-content */}
      <div
        id="calling-content"
        className="flex flex-col justify-center items-center gap-2 py-10 select-none"
      >
        <motion.div
          className="p-4 rounded-full bg-blue-500/20"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key="call"
              className="material-symbols-outlined text-6xl flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.1 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              call
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 w-full z-20">
        <motion.button
          onClick={onReject}
          className="bg-red-500 text-white px-4 py-3 rounded-full flex-1 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="material-symbols-outlined">call_end</span>
          Decline
        </motion.button>
        <motion.button
          onClick={onAccept}
          className="bg-[var(--primary-green)] text-white px-4 py-3 rounded-full flex-1 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="material-symbols-outlined">call</span>
          Accept
        </motion.button>
      </div>
    </div>
  );
};
