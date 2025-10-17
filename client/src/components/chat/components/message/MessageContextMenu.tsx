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
  position?: { x: number; y: number };
  onClose?: () => void;
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  message,
  isMe = false,
  isChannel = false,
  isSystemMessage = false,
  position,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState<
    Position | undefined
  >(position);
  const [transformOrigin, setTransformOrigin] = useState("top left");

  useEffect(() => {
    if (menuRef.current && position) {
      const menuWidth = menuRef.current.offsetWidth;
      const menuHeight = menuRef.current.offsetHeight;

      const {
        position: calculatedPosition,
        transformOrigin: calculatedOrigin,
      } = calculateContextMenuPosition(position, menuWidth, menuHeight);

      setAdjustedPosition(calculatedPosition);
      setTransformOrigin(calculatedOrigin);
    }
  }, [position]);

  return (
    <motion.div
      ref={menuRef}
      {...messageAnimations.contextMenu}
      style={{
        position: position ? "fixed" : "absolute",
        left: adjustedPosition?.x,
        top: adjustedPosition?.y,
        right: !position && isMe ? 0 : "auto",
        bottom: isChannel && !position ? -40 : "auto",
        transformOrigin: transformOrigin,
        zIndex: 999,
      }}
      className={clsx("flex flex-col gap-1 rounded-lg", "origin-top-left")}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
      }}
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
