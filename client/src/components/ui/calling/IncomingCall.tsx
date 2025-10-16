import { useState } from "react";
import { motion } from "framer-motion";
import { BounceLoader } from "react-spinners";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { VideoStream } from "./components/VideoStream";
import { useCallStore } from "@/stores/callStore/callStore";
import { useLocalPreviewVideoTrack } from "@/common/hooks/mediaStreams/useLocalPreviewVideoTrack";
import { CallActionButton } from "./CallActionButton";
import CallHeader from "./components/CallHeader";
import { callAnimations } from "@/common/animations/callAnimations";

const IncomingCall = ({ chat }: { chat: ChatResponse }) => {
  const [loaderColor, setLoaderColor] = useState("#8b8b8b");
  const isVideoCall = useCallStore((state) => state.isVideoCall);
  const declineCall = useCallStore((state) => state.declineCall);

  const { localVideoStream, isVideoEnabled, toggleVideo } =
    useLocalPreviewVideoTrack(isVideoCall);

  const acceptCall = () => {
    useCallStore.getState().joinCall({
      isVideoEnabled: isVideoCall ? isVideoEnabled : false,
      isVoiceEnabled: true,
    });
  };

  const showVideoPreview = isVideoCall && localVideoStream && isVideoEnabled;

  return (
    <div className="w-full h-full p-10 flex flex-col items-center justify-between">
      {showVideoPreview && (
        <div
          className="absolute inset-0 overflow-hidden opacity-70 w-full h-full"
          style={{ zIndex: -1 }}
        >
          <VideoStream
            stream={localVideoStream}
            className="scale-125 blur-md"
            objectCover
          />
        </div>
      )}

      <div id="calling-title" className="flex flex-col items-center">
        <CallHeader chat={chat} />
        <motion.p className="mt-1" {...callAnimations.titlePulse}>
          Incoming {isVideoCall ? "video" : "voice"} call
        </motion.p>
      </div>

      <div className="flex flex-col justify-center items-center gap-10">
        {/* 🔹 Loader changes color dynamically */}

        <div className="relative ">
          <CallActionButton
            isVideoCall={isVideoCall}
            isVideoEnabled={isVideoEnabled}
            toggleVideo={toggleVideo}
            onAccept={acceptCall}
            onDecline={declineCall}
            onDragColorChange={setLoaderColor}
          />

          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none"
            style={{ zIndex: 0, mixBlendMode: "screen" }}
          >
            <BounceLoader color={loaderColor} size={620} />
          </div>
        </div>
        <p className="opacity-40 text-sm">
          Slide up to accept, slide down to decline
        </p>
      </div>
    </div>
  );
};

export default IncomingCall;
