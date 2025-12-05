import { ChatResponse } from "@/shared/types/responses/chat.response";
import { useCallStore } from "@/stores/callStore";
import { LocalCallStatus } from "@/common/enums/LocalCallStatus";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getLocalCallStatusMessage } from "@/common/utils/call/callTextHelpers";
import CallHeader from "./components/CallHeader";
import Button from "@/components/ui/buttons/Button";

const SummaryCall = ({ chat }: { chat: ChatResponse; duration?: number }) => {
  const { t } = useTranslation();

  const localCallStatus = useCallStore((state) => state.localCallStatus);
  const error = useCallStore((state) => state.error);
  const duration = useCallStore.getState().getCallDuration();
  const closeCallModal = useCallStore.getState().closeCallModal;
  // Auto-close when call is canceled
  useEffect(() => {
    if (localCallStatus === LocalCallStatus.CANCELED) {
      closeCallModal();
    }
  }, [localCallStatus, closeCallModal]);

  const statusMessage = getLocalCallStatusMessage(
    t,
    localCallStatus,
    duration,
    error
  );

  return (
    <div className="w-full h-full p-10 flex flex-col items-center justify-between">
      <div className="flex flex-col items-center">
        <CallHeader chat={chat} />
        {statusMessage && (
          <div
            className={`mt-2 text-lg tabular-nums text-center ${
              localCallStatus === LocalCallStatus.ERROR
                ? "text-red-500"
                : "text-gray-400"
            }`}
          >
            {statusMessage}
          </div>
        )}
      </div>

      <div className="py-10 flex justify-center">
        <span
          className={`material-symbols-outlined filled text-6xl! ${
            localCallStatus === LocalCallStatus.CANCELED
              ? "text-gray-400"
              : localCallStatus === LocalCallStatus.ERROR
              ? "text-red-500 animate-pulse"
              : localCallStatus === LocalCallStatus.TIMEOUT
              ? "text-yellow-300 animate-pulse"
              : "text-red-400"
          }`}
        >
          {localCallStatus === LocalCallStatus.ERROR
            ? "e911_avatar"
            : localCallStatus === LocalCallStatus.TIMEOUT
            ? "hourglass"
            : "call_end"}
        </span>
      </div>

      <Button
        variant="danger"
        className="w-full"
        onClick={() => closeCallModal()}
      >
        {t("common.actions.close")}
      </Button>
    </div>
  );
};

export default SummaryCall;
