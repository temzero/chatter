import clsx from "clsx";
import React from "react";
import { motion } from "framer-motion";
import { useCallStore } from "@/stores/callStore/callStore";
import { useChatStore } from "@/stores/chatStore";
import { useDeviceStore } from "@/stores/deviceStore";
import { CallStatus, LocalCallStatus } from "@/types/enums/CallStatus";
import { ChatResponse } from "@/types/responses/chat.response";
import { ChatType } from "@/types/enums/ChatType";
import {
  childrenModalAnimation,
  childrenModalMobileAnimation,
} from "@/animations/modalAnimations";

import CallRoom from "../ui/calling/components/callRoom/CallRoom";
import IncomingCall from "../ui/calling/IncomingCall";
import OutgoingCall from "../ui/calling/OutgoingCall";
import ConnectingCall from "../ui/calling/ConnectingCall";
import SummaryCall from "../ui/calling/SummaryCall";
import BroadcastPreviewModal from "../ui/calling/BroadcastPreviewModal";
import BroadcastRoom from "../ui/calling/components/broadcastRoom/BroadcastRoom";

const CallModal: React.FC = () => {
  const isMobile = useDeviceStore((state) => state.isMobile);

  const { chatId, localCallStatus, callStatus } = useCallStore();
  const getOrFetchChatById = useChatStore((state) => state.getOrFetchChatById);
  const [chat, setChat] = React.useState<ChatResponse | null>(null);
  const isBroadcasting: boolean =
    chat?.type === ChatType.CHANNEL && callStatus == CallStatus.IN_PROGRESS;
  const [isExpanded, setIsExpanded] = React.useState(isBroadcasting);

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
        return isBroadcasting ? (
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
    if (isMobile || isExpanded) return "w-full h-full";

    // only when not mobile and not expanded
    if (localCallStatus === LocalCallStatus.CHECK_BROADCAST) {
      return "min-w-[420px] custom-border rounded-lg";
    }

    if (chat.type === ChatType.DIRECT) {
      return "aspect-[1/1] h-[80%] custom-border rounded-lg";
    }

    // channel (broadcast) that is not expanded
    return "w-[80%] h-[80%] custom-border rounded-lg";
  };

  const animationProps = isMobile
    ? childrenModalMobileAnimation
    : childrenModalAnimation;

  return (
    <motion.div
      {...animationProps}
      className={clsx(
        "relative flex flex-col items-center justify-between overflow-hidden transition-all select-none bg-[var(--sidebar-color)]",
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
    </motion.div>
  );
};

export default CallModal;
