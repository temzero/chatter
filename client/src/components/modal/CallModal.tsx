import React from "react";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { useCallStore } from "@/stores/callStore/callStore";
import { CallStatus } from "@/types/enums/CallStatus";

// Import UI components
import { CallRoom } from "../ui/calling/CallRoom";
import { IncomingCall } from "../ui/calling/IncomingCall";
import { SummaryCall } from "../ui/calling/SummaryCall";
import { OutgoingCall } from "../ui/calling/OutgoingCall";
import { useChatStore } from "@/stores/chatStore";
import clsx from "clsx";
import { ConnectingCall } from "../ui/calling/ConnectingCall";

const CallModal: React.FC = () => {
  const { chatId, callStatus } = useCallStore();
  const chat = useChatStore((state) => state.getChatById(chatId ?? ""));
  const fetchChatById = useChatStore((state) => state.fetchChatById);

  React.useEffect(() => {
    if (chatId && !chat) {
      fetchChatById(chatId).catch(console.error);
    }
  }, [chatId, chat, fetchChatById]);

  if (!chatId || !chat || !callStatus) {
    return null;
  }

  const renderCallUI = () => {
    switch (callStatus) {
      case CallStatus.OUTGOING:
        return <OutgoingCall chat={chat} />;
      case CallStatus.INCOMING:
        return <IncomingCall chat={chat} />;
      case CallStatus.CONNECTING:
        return <ConnectingCall chat={chat} />;
      case CallStatus.CONNECTED:
        return <CallRoom chat={chat} />;
      case CallStatus.ENDED:
      case CallStatus.ERROR:
      case CallStatus.CANCELED:
      case CallStatus.REJECTED:
        return <SummaryCall chat={chat} />;
      default:
        return null;
    }
  };

  const getSizeClasses = () => {
    return callStatus === CallStatus.CONNECTED
      ? "w-full h-full custom-border"
      : "w-full max-w-[420px] p-6";
  };

  return (
    <motion.div
      {...childrenModalAnimation}
      className="p-8 w-full h-full flex items-center justify-center select-none"
    >
      <div
        className={clsx(
          "relative bg-[var(--sidebar-color)] rounded-lg flex flex-col items-center justify-between overflow-hidden",
          getSizeClasses()
        )}
      >
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
