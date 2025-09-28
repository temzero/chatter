// components/call-room/CallHeaderInfo.tsx
import { ChatResponse } from "@/types/responses/chat.response";
import { Timer } from "@/components/ui/Timer";

interface CallHeaderInfoProps {
  chat: ChatResponse;
  memberCount: number;
  startedAt?: Date | null;
}

export const CallHeaderInfo = ({
  chat,
  memberCount,
  startedAt,
}: CallHeaderInfoProps) => {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
      <p className="text-sm truncate max-w-[200px]">
        {chat.name}
        {memberCount > 1 && (
          <span>
            🔸
            <span className="opacity-60">{memberCount + 1}</span>
          </span>
        )}
      </p>
      {startedAt && <Timer startTime={startedAt} />}
    </div>
  );
};
