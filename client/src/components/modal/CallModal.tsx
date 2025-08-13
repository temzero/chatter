import React from "react";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { useModalStore } from "@/stores/modalStore";
import { useCallStore } from "@/stores/callStore";
import { callWebSocketService } from "@/lib/websocket/services/call.websocket.service";
import { CallStatus } from "@/types/enums/modalType";

// Import UI components
import { CallActiveUI } from "../ui/calling/CallActiveUI";
import { CallIncomingUI } from "../ui/calling/CallIncomingUi";
import { CallEndedUI } from "../ui/calling/CallEndUI";
import { CallCallingUI } from "../ui/calling/CallingUI";

const CallModal: React.FC = () => {
  const { chat, callStatus, endCall, setStatus } = useCallStore();
  const closeModal = useModalStore.getState().closeModal;

  if (!chat || !callStatus) {
    return null;
  }

  const handleClose = () => {
    callWebSocketService.endCall({
      chatId: chat.id,
    });
    endCall();
    closeModal();
  };

  const handleAccept = () => {
    setStatus(CallStatus.IN_CALL);
    // Additional accept call logic would go here
  };

  const renderCallUI = () => {
    switch (callStatus) {
      case CallStatus.CALLING:
        return <CallCallingUI onCancel={handleClose} />;
      case CallStatus.INCOMING:
        return (
          <CallIncomingUI
            chat={chat}
            onAccept={handleAccept}
            onReject={handleClose}
          />
        );
      case CallStatus.IN_CALL:
        return <CallActiveUI chat={chat} onEnd={handleClose} />;
      case CallStatus.ENDED:
        return <CallEndedUI chat={chat} onClose={handleClose} />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      {...childrenModalAnimation}
      className="p-8 w-full h-full flex items-center justify-center select-none"
    >
      <div className="relative p-6 bg-[var(--sidebar-color)] rounded-lg w-full max-w-[420px] flex flex-col items-center justify-between overflow-hidden">
        {/* Background Avatar */}
        {chat?.avatarUrl && (
          <img
            src={chat.avatarUrl}
            className="absolute inset-0 overflow-hidden z-0 opacity-20 w-full h-full object-cover scale-125 blur select-none pointer-events-none"
          />
        )}

        {renderCallUI()}
      </div>
    </motion.div>
  );
};

export default CallModal;
