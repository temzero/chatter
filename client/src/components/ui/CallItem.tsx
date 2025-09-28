import React, { useState } from "react";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { CallResponseDto } from "@/types/responses/call.response";
import { useCallStore } from "@/stores/callStore/callStore";
import { useChatStore } from "@/stores/chatStore";
import { getCallColor, getCallText } from "@/utils/callHelpers";
import { formatDateTime } from "@/utils/formatDate";
import { ChatType } from "@/types/enums/ChatType";
import CallIcon from "./CallIcon";

interface CallItemProps {
  call: CallResponseDto;
  isCaller: boolean;
  onDelete?: () => void;
}

const CallItem: React.FC<CallItemProps> = ({ call, isCaller, onDelete }) => {
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
      className={`flex items-center gap-3 p-2 py-3 transition custom-border-b select-none cursor-pointer relative ${
        isHovered ? "bg-[--hover-color]" : ""
      }`}
      key={call.id}
      onClick={() => setActiveChatById(chat.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar with delete button overlay */}
      <div
        className={`relative overflow-hidden ${
          call.chat.type === ChatType.DIRECT ? "rounded-full" : "rounded-2xl"
        }`}
      >
        <ChatAvatar chat={chat} type="sidebar" />

        {isCaller && isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="absolute inset-0 flex items-center justify-center bg-red-900/50 backdrop-blur opacity-60 hover:backdrop-blur-sm shadow-md z-10"
            title="Delete Call"
          >
            <span className="material-symbols-outlined text-2xl">delete</span>
          </button>
        )}
      </div>

      <div className="flex-1">
        <p className="font-medium">{chat.name}</p>
        <p className={`${getCallColor(call.status)}`}>
          {getCallText(call.status, call.startedAt, call.endedAt)}
        </p>
        <p className="text-xs text-muted-foreground opacity-50">
          {formatDateTime(call.createdAt)}
        </p>
      </div>

      <button
        onClick={handleStartCall}
        className="group overflow-hidden relative flex items-center justify-center rounded-full w-12 h-12 text-2xl hover:custom-border hover:bg-[--hover-color]"
      >
        <CallIcon
          status={call.status}
          isCaller={isCaller}
          className="group-hover:hidden"
        />
        <div className="hidden group-hover:flex items-center justify-center bg-[--primary-green] w-full h-full">
          {call.isVideoCall ? (
            <span className="material-symbols-outlined">videocam</span>
          ) : (
            <span className="material-symbols-outlined">phone_enabled</span>
          )}
        </div>
      </button>
    </div>
  );
};

export default CallItem;
