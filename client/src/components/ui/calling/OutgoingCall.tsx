// components/ui/calling/CallCallingUI.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCallStore } from "@/stores/callStore/callStore";
import { Button } from "../Button";
import { VideoStream } from "./components/VideoStream";
import { ChatResponse } from "@/types/responses/chat.response";
import { useModalStore } from "@/stores/modalStore";
import { useLocalTracks } from "@/hooks/mediaStreams/useLocalTracks";
import CallHeader from "./components/CallHeader";
import { UpdateCallPayload } from "@/types/callPayload";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";

interface CallCallingUIProps {
  chat: ChatResponse;
}

const OutgoingCall: React.FC<CallCallingUIProps> = ({ chat }) => {
  const isVideoCall = useCallStore((state) => state.isVideoCall);
  const callId = useCallStore((state) => state.callId);
  const toggleLocalVideo = useCallStore((state) => state.toggleLocalVideo);
  const endCall = useCallStore((state) => state.endCall);
  const closeModal = useModalStore.getState().closeModal;
  const { localVideoStream } = useLocalTracks();
  const [isHovering, setIsHovering] = useState(false);

  const toggleVideoCall = async () => {
    // Wait for the local video toggle to finish
    const isVideo = await toggleLocalVideo();
    // Get the updated state after toggling
    const payload: UpdateCallPayload = {
      chatId: chat.id,
      callId: callId!,
      isVideoCall: isVideo, // send boolean
    };

    callWebSocketService.emitUpdateCall(payload);
  };

  const cancelCall = () => {
    endCall({
      isDeclined: true,
    });
    closeModal();
  };

  if (!chat) return null;

  return (
    <div
      className="w-full h-full p-10 flex flex-col items-center justify-between"
      style={{ zIndex: 1 }}
    >
      {/* Background - Avatar or Webcam */}
      {localVideoStream ? (
        <div
          className="absolute inset-0 overflow-hidden opacity-70 w-full h-full"
          style={{ zIndex: 0 }}
        >
          <VideoStream
            stream={localVideoStream}
            className="scale-125 pointer-events-none"
            objectCover
            mirror
          />
        </div>
      ) : (
        chat?.avatarUrl && (
          <img
            src={chat.avatarUrl}
            className="absolute inset-0 overflow-hidden opacity-20 w-full h-full object-cover scale-125 blur select-none pointer-events-none"
            style={{ zIndex: 0 }}
          />
        )
      )}

      <div id="calling-title" className="flex flex-col items-center mb-4">
        <CallHeader chat={chat} />
        <motion.p
          className="mt-1"
          animate={{
            opacity: [0.6, 0.2, 0.6],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
            repeatDelay: 1,
          }}
        >
          Outgoing {isVideoCall ? "video" : "voice"} call
        </motion.p>
      </div>
      {/* Calling Content */}
      <div className="flex flex-col justify-center items-center gap-4 py-10 select-none">
        <motion.button
          title={`Switch To ${isVideoCall ? "Voice" : "Video"} Call`}
          onClick={toggleVideoCall}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="p-4 rounded-full hover:bg-[--primary-green] transition-colors relative hover:custom-border"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={
                isHovering
                  ? isVideoCall
                    ? "call"
                    : "videocam"
                  : isVideoCall
                  ? "videocam"
                  : "call"
              }
              className="material-symbols-outlined filled text-6xl flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: isHovering ? 1 : [0.4, 0.8, 0.8, 0.4],
                rotate: isHovering ? 0 : [0, 15, -15, 0],
              }}
              transition={{
                duration: isHovering ? 0.3 : 0.5,
                repeat: isHovering ? 0 : Infinity,
                repeatType: "loop",
                ease: "easeInOut",
                repeatDelay: isHovering ? 0 : 0.5,
              }}
            >
              {isHovering
                ? isVideoCall
                  ? "call"
                  : "videocam"
                : isVideoCall
                ? "videocam"
                : "call"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Cancel Button */}
      <div className="flex gap-4 mt-4" style={{ zIndex: 2 }}>
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

export default OutgoingCall;
