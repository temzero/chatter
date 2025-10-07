import { motion } from "framer-motion";
import clsx from "clsx";
import { MessageActions } from "@/components/ui/MessageActions";
import { ReactionPicker } from "@/components/ui/MessageReactionPicker";
import { MessageResponse } from "@/types/responses/message.response";
import { useEffect, useRef, useState } from "react";
import {
  calculateContextMenuPosition,
  Position,
} from "@/utils/contextMenuUtils";

interface MessageContextMenuProps {
  message: MessageResponse;
  isMe?: boolean;
  isChannel?: boolean;
  position?: { x: number; y: number };
  onClose?: () => void;
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  message,
  isMe = false,
  isChannel = false,
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
      initial={{ opacity: 0, scale: 0.2 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.2 }}
      style={{
        position: position ? "fixed" : "absolute",
        left: adjustedPosition?.x,
        top: adjustedPosition?.y,
        right: !position && isMe ? 0 : "auto",
        bottom: isChannel && !position ? -40 : "auto",
        transformOrigin: transformOrigin,
      }}
      className={clsx(
        "flex flex-col gap-1 z-50 rounded-lg",
        "origin-top-left" // Tailwind fallback
      )}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <ReactionPicker
        messageId={message.id}
        chatId={message.chatId}
        isMe={isMe}
        isChannel={isChannel}
      />
      <MessageActions
        message={message}
        isMe={isMe}
        isChannel={isChannel}
        onClose={onClose}
      />
    </motion.div>
  );
};
