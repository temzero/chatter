import clsx from "clsx";
import React from "react";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { useCallStore } from "@/stores/callStore/callStore";
import { LocalCallStatus } from "@/types/enums/CallStatus";

// Import UI components
import { CallRoom } from "../ui/calling/CallRoom";
import { IncomingCall } from "../ui/calling/IncomingCall";
import { SummaryCall } from "../ui/calling/SummaryCall";
import { OutgoingCall } from "../ui/calling/OutgoingCall";
import { useChatStore } from "@/stores/chatStore";
import { ConnectingCall } from "../ui/calling/ConnectingCall";
import { ChatResponse } from "@/types/responses/chat.response";

const CallModal: React.FC = () => {
  const { chatId, localCallStatus } = useCallStore();
  const getOrFetchChatById = useChatStore((state) => state.getOrFetchChatById);

  const [chat, setChat] = React.useState<ChatResponse | null>(null);

  React.useEffect(() => {
    if (!chatId) return;

    let isMounted = true;

    (async () => {
      try {
        const result = await getOrFetchChatById(chatId, {
          fetchFullData: true,
        });
        if (isMounted) setChat(result);
      } catch (err) {
        console.error("Failed to load chat:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [chatId, getOrFetchChatById]);

  if (!chatId || !chat || !localCallStatus) {
    console.log("chatId", chatId);
    console.log("chat", chat);
    console.log("localCallStatus", localCallStatus);
    return null;
  }

  const renderCallUI = () => {
    switch (localCallStatus) {
      case LocalCallStatus.OUTGOING:
        return <OutgoingCall chat={chat} />;
      case LocalCallStatus.INCOMING:
        return <IncomingCall chat={chat} />;
      case LocalCallStatus.CONNECTING:
        return <ConnectingCall chat={chat} />;
      case LocalCallStatus.CONNECTED:
        return <CallRoom chat={chat} />;
      case LocalCallStatus.ENDED:
      case LocalCallStatus.ERROR:
      case LocalCallStatus.CANCELED:
      case LocalCallStatus.REJECTED:
        return <SummaryCall chat={chat} />;
      default:
        return null;
    }
  };

  const getSizeClasses = () =>
    localCallStatus === LocalCallStatus.CONNECTED
      ? "w-full h-full custom-border"
      : "w-full max-w-[420px] p-6";

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
