import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { useState, useRef } from "react";
import { getCurrentUserId } from "@/stores/authStore";
import { SystemEventType } from "@/shared/types/enums/system-event-type.enum";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { MessageReactionDisplay } from "@/components/ui/messages/MessageReactionsDisplay";
import { messageAnimations } from "@/common/animations/messageAnimations";
import {
  useIsMessageFocus,
  useIsReplyToThisMessage,
  setOpenFocusMessageModal,
} from "@/stores/modalStore";
import {
  SystemMessageContent,
  SystemMessageJSONContent,
} from "../../../ui/messages/content/SystemMessageContent";
import { MessageContextMenu } from "@/components/ui/contextMenu/Message-contextMenu";

type Props = {
  message: MessageResponse;
  systemEvent?: SystemEventType | null;
  senderId: string;
  senderDisplayName: string;
  content?: SystemMessageJSONContent | null;
};

const SystemMessage = ({
  message,
  systemEvent,
  senderId,
  senderDisplayName,
  content,
}: Props) => {
  const currentUserId = getCurrentUserId();
  const messageId = message.id;

  const isFocus = useIsMessageFocus(messageId);
  const isRelyToThisMessage = useIsReplyToThisMessage(messageId);

  const messageRef = useRef<HTMLDivElement>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpenFocusMessageModal(message.id);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const closeContextMenu = () => setContextMenuPosition(null);

  if (!message || !currentUserId) return null;

  return (
    <motion.div
      ref={messageRef}
      id={`message-${messageId}`}
      onContextMenu={handleContextMenu}
      className={clsx(
        "cursor-pointer rounded-full! mb-2 px-1 mx-auto flex items-center justify-center",
        {
          "border-2 border-red-500/50 bg-(--background-color)":
            message.isImportant,
          "opacity-60": !isFocus,
        }
      )}
      style={{
        zIndex: isFocus || isRelyToThisMessage ? 100 : "auto",
      }}
      layout="position"
      {...messageAnimations.SystemMessage}
    >
      {systemEvent === SystemEventType.CHAT_UPDATE_AVATAR &&
        content?.newValue && (
          <img
            src={content.newValue}
            alt="Chat Avatar"
            className="aspect-square w-[200px] h-[200px] rounded-4xl border-4 border-(--border-color)"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
        )}

      <div className="relative">
        <SystemMessageContent
          systemEvent={systemEvent}
          currentUserId={currentUserId}
          senderId={senderId}
          senderDisplayName={senderDisplayName}
          JSONcontent={content}
        />

        <MessageReactionDisplay
          isMe={false}
          isSystemMessage={true}
          messageId={messageId}
          chatId={message.chatId}
        />
      </div>
      <AnimatePresence>
        {isFocus && !isRelyToThisMessage && contextMenuPosition && (
          <MessageContextMenu
            message={message}
            isSystemMessage={true}
            initialMousePosition={contextMenuPosition}
            onClose={closeContextMenu}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SystemMessage;
