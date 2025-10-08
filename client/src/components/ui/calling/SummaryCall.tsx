import { ChatResponse } from "@/types/responses/chat.response";
import { Button } from "../Button";
import { CallHeader } from "./components/CallHeader";
import { formatDuration } from "@/utils/formatDuration";
import { useCallStore } from "@/stores/callStore/callStore";
import { LocalCallStatus } from "@/types/enums/CallStatus";
import { useEffect } from "react";
import { CallError } from "@/types/callPayload";

export const SummaryCall = ({
  chat,
}: {
  chat: ChatResponse;
  duration?: number;
}) => {
  const duration = useCallStore((state) => state.getCallDuration());
  const localCallStatus = useCallStore((state) => state.localCallStatus);
  const error = useCallStore((state) => state.error);
  const closeCallModal = useCallStore((state) => state.closeCallModal);
  // console.log("localCallStatus", localCallStatus);
  // Auto-close when call is canceled
  useEffect(() => {
    if (localCallStatus === LocalCallStatus.CANCELED) {
      closeCallModal();
    }
  }, [localCallStatus, closeCallModal]);

  const getStatusMessage = () => {
    switch (localCallStatus) {
      case LocalCallStatus.CANCELED:
        return "Call canceled";
      case LocalCallStatus.TIMEOUT:
        return "No one answered"; // more user-friendly
      case LocalCallStatus.DECLINED:
        return "Call declined";
      case LocalCallStatus.ENDED:
        return duration ? formatDuration(duration) : "Call ended";
      case LocalCallStatus.ERROR:
        if (error === CallError.LINE_BUSY) return "Line is busy";
        if (error === CallError.PERMISSION_DENIED) return "Permission denied";
        if (error === CallError.DEVICE_UNAVAILABLE) return "Device unavailable";
        if (error === CallError.CONNECTION_FAILED) return "Connection failed";
        if (error === CallError.INITIATION_FAILED)
          return "Call initiation failed";
        return "Something went wrong!";
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <CallHeader chat={chat} />
        {getStatusMessage() && (
          <div
            className={`mt-2 text-lg tabular-nums text-center ${
              localCallStatus === LocalCallStatus.ERROR
                ? "text-red-500"
                : "text-gray-400"
            }`}
          >
            {getStatusMessage()}
          </div>
        )}
      </div>

      <div className="py-10 flex justify-center">
        <span
          className={`material-symbols-outlined text-6xl ${
            localCallStatus === LocalCallStatus.CANCELED
              ? "text-gray-400"
              : localCallStatus === LocalCallStatus.ERROR
              ? "text-red-500 animate-pulse"
              : "text-red-400"
          }`}
        >
          {localCallStatus === LocalCallStatus.ERROR
            ? "e911_avatar"
            : "call_end"}
        </span>
      </div>

      <Button
        variant="danger"
        className="w-full"
        onClick={() => closeCallModal()}
      >
        Close
      </Button>
    </>
  );
};
