import { motion } from "framer-motion";
import clsx from "clsx";
import { MessageActions } from "@/components/ui/messages/MessageActions";
import { MessageReactionPicker } from "@/components/ui/messages/MessageReactionPicker";
import { MessageResponse } from "@/shared/types/responses/message.response";
import { useEffect, useRef, useState } from "react";
import {
  calculateContextMenuPosition,
  Position,
} from "@/common/utils/contextMenuUtils";
import { messageAnimations } from "@/common/animations/messageAnimations";

interface MessageContextMenuProps {
  message: MessageResponse;
  isMe?: boolean;
  isChannel?: boolean;
  isSystemMessage?: boolean;
  initialMousePosition?: { x: number; y: number };
  onClose?: () => void;
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  message,
  isMe = false,
  isChannel = false,
  isSystemMessage = false,
  initialMousePosition,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position | undefined>(undefined);
  const [transformOrigin, setTransformOrigin] = useState("top left");

  useEffect(() => {
    if (menuRef.current && initialMousePosition) {
      const menuWidth = menuRef.current.offsetWidth;
      const menuHeight = menuRef.current.offsetHeight;

      const {
        position: calculatedPosition,
        transformOrigin: calculatedOrigin,
      } = calculateContextMenuPosition(
        initialMousePosition,
        menuWidth,
        menuHeight
      );

      setPosition(calculatedPosition);
      setTransformOrigin(calculatedOrigin);
    }
  }, [initialMousePosition]);

  return (
    <motion.div
      ref={menuRef}
      {...messageAnimations.contextMenu}
      style={{
        position: "fixed",
        left: position?.x,
        top: position?.y,
        transformOrigin: transformOrigin,
        zIndex: 999,
      }}
      className={clsx("flex flex-col gap-1")}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <MessageReactionPicker
        messageId={message.id}
        chatId={message.chatId}
        isMe={isMe}
        isChannel={isChannel}
      />
      <MessageActions
        message={message}
        isMe={isMe}
        isChannel={isChannel}
        isSystemMessage={isSystemMessage}
        onClose={onClose}
      />
    </motion.div>
  );
};
