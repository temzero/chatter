import clsx from "clsx";
import React from "react";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { useCallStore } from "@/stores/callStore/callStore";
import { LocalCallStatus } from "@/types/enums/CallStatus";

import { CallRoom } from "../ui/calling/components/callRoom/CallRoom";
import { IncomingCall } from "../ui/calling/IncomingCall";
import { SummaryCall } from "../ui/calling/SummaryCall";
import { OutgoingCall } from "../ui/calling/OutgoingCall";
import { useChatStore } from "@/stores/chatStore";
import { ConnectingCall } from "../ui/calling/ConnectingCall";
import { ChatResponse } from "@/types/responses/chat.response";
import { BroadcastPreviewModal } from "../ui/calling/BroadcastPreviewModal";
import { ChatType } from "@/types/enums/ChatType";
import { BroadcastRoom } from "../ui/calling/components/broadcastRoom/BroadcastRoom";

const CallModal: React.FC = () => {
  const { chatId, localCallStatus } = useCallStore();
  const getOrFetchChatById = useChatStore((state) => state.getOrFetchChatById);
  const [chat, setChat] = React.useState<ChatResponse | null>(null);
  const isBroadcast: boolean = chat?.type === ChatType.CHANNEL;
  const [isExpanded, setIsExpanded] = React.useState(isBroadcast);

  React.useEffect(() => {
    if (chat?.type === ChatType.CHANNEL) {
      setIsExpanded(true);
    }
  }, [chat?.type]);

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
        return isBroadcast ? (
          <BroadcastRoom
            chat={chat}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded((p) => !p)}
          />
        ) : (
          <CallRoom
            chat={chat}
            isExpanded={isExpanded}
            onToggleExpand={() => setIsExpanded((p) => !p)}
          />
        );
      case LocalCallStatus.ENDED:
      case LocalCallStatus.ERROR:
      case LocalCallStatus.CANCELED:
      case LocalCallStatus.TIMEOUT:
      case LocalCallStatus.DECLINED:
        return <SummaryCall chat={chat} />;
      case LocalCallStatus.CHECK_BROADCAST:
        return <BroadcastPreviewModal chat={chat} />;
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

  const modalSize = isExpanded
    ? "w-full h-full"
    : chat.type === ChatType.DIRECT
    ? "aspect-[1/1] h-[80%]"
    : "w-[80%] h-[80%]";

  return (
    <motion.div
      {...childrenModalAnimation}
      className={`${modalSize} transition-all flex items-center justify-center select-none`}
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
