import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { useModalStore } from "@/stores/modalStore";
import { Avatar } from "../ui/avatar/Avatar";
import { CallStatus } from "@/types/enums/modalType";
import { BounceLoader } from "react-spinners";
import { ChatAvatar } from "../ui/avatar/ChatAvatar";
import { useCallStore } from "@/stores/callStore";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";

const CallModal: React.FC = () => {
  const {
    chat,
    isVideoCall,
    isGroupCall,
    callStatus: status,
    participants,
    switchType,
    endCall,
    setStatus,
  } = useCallStore();
  const closeModal = useModalStore.getState().closeModal;

  const [localIsVideoCall, setLocalIsVideoCall] = useState(isVideoCall);

  if (!chat || !status) {
    return null;
  }

  const handleClose = () => {
    // Emit end call event
    callWebSocketService.endCall({
      chatId: chat?.id || "",
    });
    closeModal();
    if (status === CallStatus.CALLING || status === CallStatus.INCOMING) {
      endCall();
    } else if (status === CallStatus.IN_CALL) {
      endCall();
    }
  };

  const handleSwitchCallType = () => {
    setLocalIsVideoCall((prev) => !prev);
    switchType();
  };

  const handleAccept = () => {
    closeModal();
    setStatus(CallStatus.IN_CALL);
    // You might want to add additional logic here for accepting the call
  };

  const cancelClasses = "bg-red-500 px-4 py-1 rounded flex items-center";

  return (
    <motion.div
      {...childrenModalAnimation}
      className="p-8 w-full h-full flex items-center justify-center select-none"
    >
      <div className="relative bg-[var(--sidebar-color)] rounded-lg p-6 w-[360px] flex flex-col items-center justify-between custom-border overflow-hidden">
        {/* Background Avatar */}
        {chat?.avatarUrl && (
          <img
            src={chat.avatarUrl}
            className="absolute inset-0 overflow-hidden z-0 opacity-20 w-full h-full object-cover scale-125 blur select-none pointer-events-none"
          />
        )}
        <div id="calling-title" className="flex flex-col items-center z-20">
          {/* Avatar Section */}
          {chat && <ChatAvatar chat={chat} type="call" />}
          {isGroupCall && participants && (
            <div className="flex flex-wrap justify-center gap-2">
              {participants.slice(0, 4).map((p) => (
                <Avatar
                  key={p.id}
                  avatarUrl={p.avatar}
                  name={p.name}
                  size="10"
                />
              ))}
              {participants.length > 4 && (
                <span className="text-sm opacity-60">
                  +{participants.length - 4} more
                </span>
              )}
            </div>
          )}
          {/* Title */}
          <h2 className="text-xl font-semibold mt-2">{chat?.name}</h2>
        </div>

        {/* calling-content */}
        <div
          id="calling-content"
          className="flex flex-col justify-center items-center gap-2 py-10 select-none"
        >
          <motion.button
            id="switchCallType"
            title={`Switch To ${localIsVideoCall ? "Voice" : "Video"} Call`}
            onClick={handleSwitchCallType}
            className="p-3 rounded-full hover:bg-[--primary-green] transition-colors relative hover:custom-border"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
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

            {status === "calling" && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none z-0">
                <BounceLoader color="#8b8b8b" size={500} />
              </div>
            )}
          </motion.button>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-4  z-20">
          {status === "incoming" && (
            <>
              <motion.button
                onClick={handleAccept}
                className="bg-[var(--primary-green)] px-4 py-2 rounded-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Accept
              </motion.button>
              <motion.button
                onClick={handleClose}
                className={cancelClasses}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Decline
              </motion.button>
            </>
          )}

          {status === CallStatus.CALLING && (
            <motion.button
              onClick={handleClose}
              className={cancelClasses}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
          )}

          {status === CallStatus.IN_CALL && (
            <motion.button
              onClick={handleClose}
              className={cancelClasses}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              End Call
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CallModal;
