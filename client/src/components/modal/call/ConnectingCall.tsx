// src/components/ui/calling/ConnectingCall.tsx
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { BeatLoader } from "react-spinners";
import { useCallStore } from "@/stores/callStore";
import { useTranslation } from "react-i18next";
import CallHeader from "./components/CallHeader";

const ConnectingCall = ({ chat }: { chat: ChatResponse }) => {
  const { t } = useTranslation();

  const isVideoCall = useCallStore((state) => state.isVideoCall);

  return (
    <div className="w-full h-full p-10 flex flex-col items-center justify-between gap-4">
      {/* Header (avatar + chat name) */}
      <CallHeader chat={chat} />
      <div className="flex flex-col items-center gap-2 mt-8">
        <BeatLoader color="#808080" margin={6} size={10} />
        {/* Status text */}
        <p className="text-gray-400 text-sm">
          {t(`call.connecting.${isVideoCall ? "video" : "voice"}`)}
        </p>
      </div>

      {/* Optional: hang up button */}
      <button
        onClick={() => useCallStore.getState().endCall()}
        className="mt-6 px-6 py-3 hover:bg-red-500 rounded-full! flex items-center gap-2"
      >
        {t("common.actions.cancel")}
      </button>
    </div>
  );
};

export default ConnectingCall;
