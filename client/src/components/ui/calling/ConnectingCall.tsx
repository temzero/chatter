// src/components/ui/calling/ConnectingCall.tsx
import { ChatResponse } from "@/types/responses/chat.response";
import { BounceLoader } from "react-spinners";
import { CallHeader } from "./components/CallHeader";
import { useCallStore } from "@/stores/callStore";

export const ConnectingCall = ({ chat }: { chat: ChatResponse }) => {
  const { isVideoCall } = useCallStore();

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-8">
      {/* Header (avatar + chat name) */}
      <CallHeader chat={chat} />

      {/* Status text */}
      <p className="text-gray-400 text-sm">
        Connecting {isVideoCall ? "video" : "voice"} call...
      </p>

      {/* Loader animation */}
      <BounceLoader color="var(--primary-green)" size={100} />

      {/* Optional: hang up button */}
      <button
        onClick={() => useCallStore.getState().rejectCall()}
        className="mt-6 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center gap-2"
      >
        <span className="material-symbols-outlined">call_end</span>
        Cancel
      </button>
    </div>
  );
};
