import clsx from "clsx";
import React from "react";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { useCallStore } from "@/stores/callStore/callStore";
import { LocalCallStatus } from "@/types/enums/CallStatus";

// Import UI components
import { CallRoom } from "../ui/calling/components/callRoom/CallRoom";
import { IncomingCall } from "../ui/calling/IncomingCall";
import { SummaryCall } from "../ui/calling/SummaryCall";
import { OutgoingCall } from "../ui/calling/OutgoingCall";
import { useChatStore } from "@/stores/chatStore";
import { ConnectingCall } from "../ui/calling/ConnectingCall";
import { ChatResponse } from "@/types/responses/chat.response";
import { CheckBroadcast } from "../ui/calling/CheckBroadcast";
import { ChatType } from "@/types/enums/ChatType";
import { BroadcastRoom } from "../ui/calling/components/callRoom/BroadcastRoom";

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
    // if (!chatId) {
    //   console.log("No chatId", chatId);
    // } else if (!chat) {
    //   console.log("No chat", chat);
    // } else if (!localCallStatus) {
    //   console.log("No localCallStatus", localCallStatus);
    // }
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
        return chat.type === ChatType.CHANNEL ? (
          <BroadcastRoom chat={chat} />
        ) : (
          <CallRoom chat={chat} />
        );
      case LocalCallStatus.ENDED:
      case LocalCallStatus.ERROR:
      case LocalCallStatus.CANCELED:
      case LocalCallStatus.TIMEOUT:
      case LocalCallStatus.DECLINED:
        return <SummaryCall chat={chat} />;
      case LocalCallStatus.CHECK_BROADCAST:
        return <CheckBroadcast chat={chat} />;
      default:
        return null;
    }
  };

  const getSizeClasses = () => {
    switch (localCallStatus) {
      case LocalCallStatus.CONNECTED:
        return "w-full h-full custom-border";
      case LocalCallStatus.CHECK_BROADCAST:
        return "min-w-[420px] custom-border p-6";
      default:
        return "w-full max-w-[420px] p-6";
    }
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
