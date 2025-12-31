import React, { useState } from "react";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { CallResponse } from "@/shared/types/responses/call.response";
import { useCallStore } from "@/stores/callStore";
import { useChatStore } from "@/stores/chatStore";
import { getCallStatusColor } from "@/common/utils/call/callHelpers";
import { getCallStatusText } from "@/common/utils/call/callTextHelpers";
import { formatDateTime } from "@/common/utils/format/formatDateTime";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import CallIcon from "@/components/ui/icons/CallIcon";
import { useTranslation } from "react-i18next";

interface CallItemProps {
  call: CallResponse;
  isCaller: boolean;
  onDelete?: () => void;
}

const CallItem: React.FC<CallItemProps> = ({ call, isCaller, onDelete }) => {
  const { t } = useTranslation();

  const startCall = useCallStore.getState().startCall;
  const setActiveChatId = useChatStore.getState().setActiveChatId;

  const [isHovered, setIsHovered] = useState(false);

  const getChatInfo = (call: CallResponse) => {
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
    startCall(chat.id, { isVideoCall: call.isVideoCall });
  };

  const roundedClass =
    call.chat.type === ChatType.DIRECT ? "rounded-full!" : "rounded-2xl";

  const isChannel = call.chat.type === ChatType.CHANNEL;

  return (
    <div
      className={`flex items-center gap-3 p-2 py-3 transition custom-border-b select-none cursor-pointer relative ${
        isHovered ? "bg-(--hover-color)" : ""
      }`}
      key={call.id}
      onClick={() => setActiveChatId(chat.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isCaller && (
        <div className="bg-(--primary-green) w-[3px] h-full absolute left-0 top-0" />
      )}
      <div className={`relative overflow-hidden ml-1.5 ${roundedClass}`}>
        <ChatAvatar chat={chat} type="sidebar" />
      </div>

      <>
        <div className="flex-1">
          <p className="font-medium">{chat.name}</p>
          <p className={`${getCallStatusColor(call.status)}`}>
            {getCallStatusText(t, call.status, call.startedAt, call.endedAt)}
          </p>
          <p className="text-xs text-muted-foreground opacity-50">
            {formatDateTime(call.createdAt)}
          </p>
        </div>

        {isCaller && isHovered && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className={`w-8 h-8 flex items-center justify-center bg-(--panel-color) opacity-60 hover:opacity-100 hover:bg-red-500 rounded-full! custom-border`}
            title="Delete Call"
          >
            <span className="material-symbols-outlined text-2xl!">delete</span>
          </button>
        )}

        <button
          onClick={handleStartCall}
          className="group overflow-hidden relative flex items-center justify-center rounded-full! w-12 h-12 text-2xl hover:custom-border hover:bg-(--hover-color) hover:opacity-100"
        >
          <CallIcon
            status={call.status}
            isBroadcast={isChannel}
            className="group-hover:hidden"
          />
          <div
            title={isCaller ? "Call again" : "Call back"}
            className="hidden group-hover:flex items-center justify-center bg-(--primary-green) w-full h-full"
          >
            {call.isVideoCall ? (
              <span className="material-symbols-outlined">videocam</span>
            ) : (
              <span className="material-symbols-outlined">phone_enabled</span>
            )}
          </div>
        </button>
      </>
    </div>
  );
};

export default CallItem;
