import { ChatResponse } from "@/types/responses/chat.response";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { Timer } from "@/components/ui/Timer";

interface BroadcastInfoProps {
  chat: ChatResponse;
  participantCount: number;
  startedAt?: Date | null;
}

export const BroadcastInfo: React.FC<BroadcastInfoProps> = ({
  chat,
  participantCount,
  startedAt,
}) => {
  return (
    <>
      {/* Left bottom: audience + chat info */}
      <div className="flex gap-2 opacity-60 hover:opacity-100 z-20 absolute bottom-2 left-2">
        <ChatAvatar chat={chat} type="header" />
        <div className="flex flex-col justify-end">
          <h1 className="flex items-center gap-1 text-xs -mb-0.5">
            {participantCount} audience
          </h1>
          <h1 className="text-lg font-semibold">{chat.name}</h1>
        </div>
      </div>

      {/* Right bottom: timer */}
      <div className="flex gap-2 opacity-60 hover:opacity-100 items-center z-20 absolute bottom-1 right-2.5">
        {startedAt && <Timer startTime={startedAt} />}
      </div>
    </>
  );
};
