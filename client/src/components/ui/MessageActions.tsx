// components/ui/MessageActions.tsx
import React from "react";
import classNames from "classnames";
import { motion } from "framer-motion";
import { MessageResponse } from "@/types/messageResponse";
import { useMessageStore } from "@/stores/messageStore";
import { useModalStore } from "@/stores/modalStore";

interface MessageActionsProps {
  message: MessageResponse;
  position?: "left" | "right";
  className?: string;
  close: () => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  position = "left",
  className = "",
  close,
}) => {
  const setReplyToMessage = useMessageStore((state) => state.setReplyToMessage);
  const deleteMessage = useMessageStore((state) => state.deleteMessage);

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
      icon: "arrow_warm_up",
      label: "Forward",
      action: () => {
        useModalStore.getState().openModal("forward-message", { message });
        close();
      },
    },
    {
      icon: "keep",
      label: "Pin",
      // action: onPin,
    },
    {
      icon: "bookmark",
      label: "Save",
      // action: onSave,
    },
    {
      icon: "delete",
      label: "Delete",
      action: () => deleteMessage(message.id),
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
            "p-1 rounded-full flex flex-col items-center justify-center opacity-70 hover:opacity-100 ",
            "transition-all duration-200 cursor-pointer"
          )}
          onClick={(e) => {
            e.stopPropagation();
            action.action?.();
          }}
          title={action.label}
        >
          <i className={`material-symbols-outlined text-2xl hover:scale-150 transition-all duration-300 ${action.label === 'Forward' && 'rotate-90'}`}>
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
