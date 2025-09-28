import React, { useState } from "react";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { CallResponseDto } from "@/types/responses/call.response";
import { useCallStore } from "@/stores/callStore/callStore";
import { useChatStore } from "@/stores/chatStore";
import { getCallText, getCallClass, getCallIcon } from "@/utils/callHelpers";
import { formatDateTime } from "@/utils/formatDate";

interface CallItemProps {
  call: CallResponseDto;
}

const CallItem: React.FC<CallItemProps> = ({ call }) => {
  const startCall = useCallStore((state) => state.startCall);
  const setActiveChatById = useChatStore.getState().setActiveChatById;

  const [isHovered, setIsHovered] = useState(false);

  const getChatInfo = (call: CallResponseDto) => {
    const name =
      call.chat.name ||
      call.initiator.nickname ||
      `${call.initiator.firstName} ${call.initiator.lastName}` ||
      "Unknown Chat";

    return {
      id: call.chat.id,
      name,
      avatarUrl: call.chat.avatarUrl || call.initiator.avatarUrl,
      type: call.chat.type,
      myMemberId: call.chat.myMemberId,
    };
  };

  const chat = getChatInfo(call);

  const handleStartCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    startCall(chat.id, call.isVideoCall);
  };

  return (
    <div
      className={`flex items-center gap-3 p-2 py-3 transition custom-border-b select-none cursor-pointer ${
        isHovered ? "bg-[--hover-color]" : ""
      }`}
      onClick={() => setActiveChatById(chat.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ChatAvatar chat={chat} type="sidebar" />
      <div className="flex-1">
        <p className="font-medium">{chat.name}</p>
        <p className="text-sm flex items-center gap-1">
          <span className={getCallClass(call.status)}>
            {getCallText(call.status, call.startedAt, call.endedAt)}
          </span>
        </p>
        <p className="text-xs text-muted-foreground opacity-50">
          {formatDateTime(call.startedAt)}
        </p>
      </div>
      <button
        onClick={handleStartCall}
        onMouseEnter={() => setIsHovered(false)} // Disable parent hover when hovering button
        onMouseLeave={() => setIsHovered(true)} // Re-enable parent hover when leaving button
        className="group overflow-hidden relative flex items-center justify-center rounded-full w-12 h-12 text-2xl hover:custom-border hover:bg-[--hover-color]"
      >
        <span
          className={`material-symbols-outlined group-hover:hidden ${getCallClass(
            call.status
          )}`}
        >
          {getCallIcon(call.status)}
        </span>
        <div className="hidden group-hover:flex items-center justify-center bg-[--primary-green] w-full h-full">
          {call.isVideoCall ? (
            <span className="material-symbols-outlined">videocam</span>
          ) : (
            <span className="material-symbols-outlined">phone</span>
          )}
        </div>
      </button>
    </div>
  );
};

export default CallItem;
