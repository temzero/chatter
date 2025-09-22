// components/ui/calling/CallCallingUI.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PulseLoader } from "react-spinners";
import { useCallStore } from "@/stores/callStore/callStore";
import { CallHeader } from "./components/CallHeader";
import { Button } from "../Button";
import { VideoStream } from "./components/VideoStream";
import { ChatResponse } from "@/types/responses/chat.response";
import { useModalStore } from "@/stores/modalStore";
import { useLocalTracks } from "@/hooks/mediaStreams/useLocalTracks";

interface CallCallingUIProps {
  chat: ChatResponse;
}

export const OutgoingCall: React.FC<CallCallingUIProps> = ({ chat }) => {
  const isVideoCall = useCallStore((state) => state.isVideoCall);
  const toggleLocalVideo = useCallStore((state) => state.toggleLocalVideo);
  const endCall = useCallStore((state) => state.endCall);
  const closeModal = useModalStore.getState().closeModal;
  const { localVideoStream } = useLocalTracks();

  const cancelCall = () => {
    endCall({
      isRejected: true,
    });
    closeModal();
  };

  if (!chat) return null;

  return (
    <div className="flex flex-col items-center justify-between w-full h-full z-20">
      {/* Background - Avatar or Webcam */}
      {localVideoStream ? (
        <div className="absolute inset-0 overflow-hidden z-0 opacity-70 w-full h-full">
          <VideoStream
            stream={localVideoStream}
            className="w-full h-full object-cover scale-125 select-none pointer-events-none"
            muted
          />
        </div>
      ) : (
        chat?.avatarUrl && (
          <img
            src={chat.avatarUrl}
            className="absolute inset-0 overflow-hidden z-0 opacity-20 w-full h-full object-cover scale-125 blur select-none pointer-events-none"
          />
        )
      )}

      {/* Rest of the UI remains exactly the same */}
      <CallHeader chat={chat} />
      {/* Calling Content */}
      <div className="flex flex-col justify-center items-center gap-4 py-10 select-none">
        <motion.button
          title={`Switch To ${isVideoCall ? "Voice" : "Video"} Call`}
          onClick={() => toggleLocalVideo()}
          className="p-4 rounded-full hover:bg-[--primary-green] transition-colors relative hover:custom-border"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={isVideoCall ? "videocam" : "call"}
              className="material-symbols-outlined text-6xl flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.1 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {isVideoCall ? "videocam" : "call"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
        <PulseLoader color="#808080" margin={6} size={10} />
      </div>

      {/* Cancel Button */}
      <div className="flex gap-4 mt-4 z-50">
        <Button
          onClick={cancelCall}
          variant="danger"
          size="lg"
          isRoundedFull
          className="px-6 py-2"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
