// components/ui/MessageActions.tsx

import React from "react";
import classNames from "classnames";

interface MessageActionsProps {
  onDelete: () => void;
  position?: "left" | "right";
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  onDelete,
  position = "left",
}) => {
  const positionClass =
    position === "right"
      ? "absolute -bottom-6 left-0"
      : "absolute -bottom-6 right-0";

  return (
    <div
      className={classNames(
        "flex gap-2 opacity-100 transition-opacity duration-200 cursor-pointer bg-[var(--sidebar-color)] p-1 rounded z-20",
        positionClass
      )}
    >
      <i className="material-symbols-outlined text-2xl hover:scale-150 opacity-80 hover:opacity-100 duration-200 rounded-full rotate-180">
        reply
      </i>
      <i className="material-symbols-outlined text-2xl hover:scale-150 opacity-80 hover:opacity-100 duration-200 rounded-full">
        send
      </i>
      <i className="material-symbols-outlined text-2xl hover:scale-150 opacity-80 hover:opacity-100 duration-200 rounded-full">
        keep
      </i>
      <i
        className="material-symbols-outlined text-2xl hover:scale-150 opacity-80 hover:opacity-100 duration-200 rounded-full"
        onClick={onDelete}
      >
        delete
      </i>
    </div>
  );
};
