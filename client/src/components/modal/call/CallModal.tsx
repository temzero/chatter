import clsx from "clsx";
import React from "react";
import { motion } from "framer-motion";
import { useCallStore } from "@/stores/callStore";
import { useChatStore } from "@/stores/chatStore";
import { useIsMobile } from "@/stores/deviceStore";
import { LocalCallStatus } from "@/common/enums/LocalCallStatus";
import { CallStatus } from "@/shared/types/enums/call-status.enum";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { modalAnimations } from "@/common/animations/modalAnimations";

import CallRoom from "@/components/modal/call/callRoom/CallRoom";
import IncomingCall from "@/components/modal/call/IncomingCall";
import OutgoingCall from "@/components/modal/call/OutgoingCall";
import ConnectingCall from "@/components/modal/call/ConnectingCall";
import SummaryCall from "@/components/modal/call/SummaryCall";
import BroadcastPreviewModal from "@/components/modal/call/BroadcastPreviewModal";
import BroadcastRoom from "@/components/modal/call/broadcastRoom/BroadcastRoom";
import logger from "@/common/utils/logger";

const CallModal: React.FC = () => {
  const isMobile = useIsMobile();
  const getOrFetchChatById = useChatStore.getState().getOrFetchChatById;

  const chatId = useCallStore((state) => state.chatId);
  const localCallStatus = useCallStore((state) => state.localCallStatus);
  const callStatus = useCallStore((state) => state.callStatus);

  const [chat, setChat] = React.useState<ChatResponse | null>(null);
  const isBroadcasting: boolean =
    chat?.type === ChatType.CHANNEL && callStatus == CallStatus.IN_PROGRESS;
  const [isExpanded, setIsExpanded] = React.useState(isBroadcasting);

  React.useEffect(() => {
    if (!chatId) return;

    let isMounted = true;

    // Named async function for clarity
    const fetchChat = async () => {
      try {
        const result = await getOrFetchChatById(chatId, {
          fetchFullData: true,
        });
        if (isMounted) setChat(result);
      } catch (err) {
        logger.error("Failed to load chat:", err);
      }
    };

    fetchChat();

    return () => {
      isMounted = false;
      useCallStore.getState().clearLiveKitState();
      useCallStore.getState().clearCallData();
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
    ? modalAnimations.childrenMobile
    : modalAnimations.children;

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
