import { ChatResponse } from "@/types/responses/chat.response";
import { motion, AnimatePresence } from "framer-motion";
import { CallHeader } from "./components/CallHeader";
import { BounceLoader } from "react-spinners";
import { Button } from "../Button";
import { VideoStream } from "./components/VideoStream";
import { useCallStore } from "@/stores/callStore/callStore";
import { useLocalPreviewVideoTrack } from "@/hooks/mediaStreams/useLocalPreviewVideoTrack";

export const IncomingCall = ({ chat }: { chat: ChatResponse }) => {
  const isVideoCall = useCallStore((state) => state.isVideoCall);

  // Always call the hook
  const { localVideoStream, isVideoEnabled, toggleVideo } =
    useLocalPreviewVideoTrack(isVideoCall);

  const acceptCall = () => {
    useCallStore.getState().acceptCall({
      isVideoEnabled: isVideoCall ? isVideoEnabled : false, // respect video call
      isVoiceEnabled: true,
    });
  };

  const rejectCall = () => {
    useCallStore.getState().rejectCall();
    useCallStore.getState().closeCallModal();
  };

  const showVideoPreview = isVideoCall && localVideoStream && isVideoEnabled;

  return (
    <div className="flex flex-col items-center w-full h-full">
      {/* Background - Avatar or Webcam */}
      {showVideoPreview && (
        <div className="absolute inset-0 overflow-hidden z-0 opacity-70 w-full h-full">
          <VideoStream
            stream={localVideoStream}
            className="w-full h-full object-cover scale-125 blur-md select-none pointer-events-none"
            muted
          />
        </div>
      )}

      {/* Header with avatar */}
      <div id="calling-title" className="flex flex-col items-center z-50">
        <CallHeader chat={chat} />
        <p className="text-sm text-gray-400 mt-1">
          Incoming {isVideoCall ? "video" : "voice"} call
        </p>
      </div>

      {/* calling-content */}
      <div className="flex flex-col justify-center items-center gap-4 py-6 select-none z-0">
        <motion.button
          title={`Incoming ${isVideoCall ? "Video" : "Voice"} Call`}
          className="p-4 rounded-full hover:bg-[--primary-green] transition-colors relative hover:custom-border"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={
                isVideoCall
                  ? isVideoEnabled
                    ? "videocam"
                    : "videocam_off"
                  : "call"
              }
              onClick={isVideoCall ? toggleVideo : undefined}
              className="material-symbols-outlined text-6xl flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.1 }}
              animate={{
                opacity: 1,
                scale: 1,
                x: [0, -5, 5, -5, 5, 0],
              }}
              transition={{
                x: { duration: 0.5, repeat: Infinity, repeatDelay: 1 },
                opacity: { duration: 0.2 },
                scale: { duration: 0.2 },
              }}
            >
              {isVideoCall
                ? isVideoEnabled
                  ? "videocam"
                  : "videocam_off"
                : "call"}
            </motion.span>
          </AnimatePresence>

          {/* Loader */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 z-0 pointer-events-none">
            <BounceLoader color="#8b8b8b" size={500} />
          </div>
        </motion.button>
      </div>

      {/* Actions */}
      <div className="flex gap-4 w-full z-50">
        <Button
          onClick={acceptCall}
          variant="success"
          size="lg"
          isRoundedFull
          fullWidth
          iconPosition="left"
          className="py-3"
        >
          Accept
        </Button>
        <Button
          onClick={rejectCall}
          variant="danger"
          size="lg"
          isRoundedFull
          fullWidth
          iconPosition="left"
          className="py-3"
        >
          Decline
        </Button>
      </div>
    </div>
  );
};
