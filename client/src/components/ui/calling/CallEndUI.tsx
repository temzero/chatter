import { ChatResponse } from "@/types/responses/chat.response";
import { Button } from "../Button";

import { CallHeader } from "./components/CallHeader";
import { formatDuration } from "@/utils/formatDuration";
import { useCallStore } from "@/stores/callStore";

export const CallEndedUI = ({
  chat,
  onClose,
}: {
  chat: ChatResponse;
  onClose: () => void;
  duration?: number;
}) => {
  const duration = useCallStore((state) => state.getCallDuration());

  return (
    <>
      <div className="flex flex-col items-center z-20">
        <CallHeader chat={chat} />
        <p className="text-sm text-gray-400 mt-1">Call ended</p>

        {duration && (
          <div className="mt-2 text-lg tabular-nums">
            {formatDuration(duration)}
          </div>
        )}
      </div>

      <div className="py-10 flex justify-center">
        <div className="p-6 rounded-full bg-red-500/20">
          <span className="material-symbols-outlined text-4xl">call_end</span>
        </div>
      </div>

      <Button variant="primary" className="w-full py-3" onClick={onClose}>
        Close
      </Button>
    </>
  );
};
