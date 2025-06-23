// components/ui/MessageActions.tsx
import React from "react";
import classNames from "classnames";
import { motion } from "framer-motion";
import { MessageResponse } from "@/types/messageResponse";
import { useMessageStore } from "@/stores/messageStore";

interface MessageActionsProps {
  message: MessageResponse;
  onDelete: () => void;
  onPin?: () => void;
  onForward?: () => void;
  onSave?: () => void;
  close: () => void;
  position?: "left" | "right";
  className?: string;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  onDelete,
  onForward,
  onPin,
  onSave,
  close,
  position = "left",
  className = "",
}) => {
  const setReplyToMessage = useMessageStore((state) => state.setReplyToMessage);

  const positionClass =
    position === "right"
      ? "origin-bottom-left left-0"
      : "origin-bottom-right right-0";

  const actions = [
    {
      icon: "prompt_suggestion",
      label: "Reply",
      action: () => {
        setReplyToMessage(message);
        // scrollToInput();
        close();
      },
    },
    {
      icon: "send",
      label: "Forward",
      action: onForward,
    },
    {
      icon: "keep",
      label: "Pin",
      action: onPin,
    },
    {
      icon: "bookmark",
      label: "Save",
      action: onSave,
    },
    {
      icon: "delete",
      label: "Delete",
      action: onDelete,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.5, y: -10 }}
      // transition={{ duration: 0.2 }}
      className={classNames(
        "absolute -bottom-10 flex gap-2 bg-[var(--sidebar-color)]",
        "p-1.5 rounded-lg shadow-lg z-50",
        positionClass,
        className
      )}
    >
      {actions.map((action, index) => (
        <button
          key={index}
          className={classNames(
            "p-1 rounded-full flex flex-col items-center justify-center",
            "transition-all duration-200 cursor-pointer"
          )}
          onClick={(e) => {
            e.stopPropagation();
            action.action?.();
          }}
          title={action.label}
        >
          <i className="material-symbols-outlined text-2xl hover:scale-150 transition-all duration-300">
            {action.icon}
          </i>
          {/* <span className="text-xs mt-0.5 opacity-80 hidden group-hover:block">
            {action.label}
          </span> */}
        </button>
      ))}
    </motion.div>
  );
};
