import { ChatResponse } from "@/types/responses/chat.response";
import { Button } from "../Button";
import { CallHeader } from "./components/CallHeader";
import { formatDuration } from "@/utils/formatDuration";
import { useCallStore } from "@/stores/callStore";
import { CallStatus } from "@/types/enums/modalType";
import { useEffect } from "react"; // Import useEffect

export const SummaryCall = ({
  chat,
}: {
  chat: ChatResponse;
  duration?: number;
}) => {
  const duration = useCallStore((state) => state.getCallDuration());
  const callStatus = useCallStore((state) => state.callStatus);
  const closeCallModal = useCallStore((state) => state.closeCallModal);

  // Add this useEffect to close modal when call is canceled
  useEffect(() => {
    if (callStatus === CallStatus.CANCELED) {
      closeCallModal();
    }
  }, [callStatus, closeCallModal]);

  const getStatusMessage = () => {
    switch (callStatus) {
      case CallStatus.CANCELED:
        return "Call canceled";
      case CallStatus.REJECTED:
        return "Call rejected";
      case CallStatus.ENDED:
        return duration > 0 ? formatDuration(duration) : "Call ended";
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex flex-col items-center z-20">
        <CallHeader chat={chat} />
        {getStatusMessage() && (
          <div className="mt-2 text-lg tabular-nums text-gray-400">
            {getStatusMessage()}
          </div>
        )}
      </div>

      <div className="py-10 flex justify-center">
        <span
          className={`material-symbols-outlined text-6xl ${
            callStatus === CallStatus.CANCELED
              ? "text-gray-400"
              : "text-red-500"
          }`}
        >
          call_end
        </span>
      </div>

      <Button variant="danger" className="w-full" onClick={closeCallModal}>
        Close
      </Button>
    </>
  );
};
