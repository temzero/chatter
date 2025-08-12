import React from "react";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { useModalStore } from "@/stores/modalStore";
import { Avatar } from "../ui/avatar/Avatar";
import { CallMode, CallStatus, CallType } from "@/types/enums/modalType";

interface CallModalProps {
  callType: CallType;
  callMode: CallMode;
  status: CallStatus;
  partner?: {
    id: string;
    name: string;
    avatarUrl: string;
  }; // for direct calls
  participants?: {
    id: string;
    name: string;
    avatarUrl: string;
  }[]; // for group calls
  onAccept?: () => void;
  onReject?: () => void;
  onEnd?: () => void;
}

const CallModal: React.FC = () => {
  const modalContent = useModalStore((state) => state.modalContent);
  const props = modalContent?.props as CallModalProps | undefined;
  const closeModal = useModalStore.getState().closeModal;

  if (!props) return null;

  const {
    callType,
    callMode,
    partner,
    participants,
    status,
    onAccept,
    onReject,
    onEnd,
  } = props;

  const handleClose = () => {
    closeModal();
    if (status === "calling" || status === "incoming") {
      onReject?.();
    } else if (status === "in-call") {
      onEnd?.();
    }
  };

  const cancelClasses = "bg-red-500 px-4 py-1 rounded-full flex items-center";

  return (
    <motion.div
      {...childrenModalAnimation}
      className="p-8 w-full h-full flex items-center justify-center"
    >
      <div className="bg-[var(--sidebar-color)] rounded-lg p-6 w-[360px] flex flex-col items-center justify-center custom-border">
        {/* Avatar Section */}
        {callMode === "direct" && partner && (
          <Avatar avatarUrl={partner.avatarUrl} name={partner.name} size="16" />
        )}

        {callMode === "group" && participants && (
          <div className="flex flex-wrap justify-center gap-2">
            {participants.slice(0, 4).map((p) => (
              <Avatar
                key={p.id}
                avatarUrl={p.avatarUrl}
                name={p.name}
                size="10"
              />
            ))}
            {participants.length > 4 && (
              <span className="text-sm opacity-60">
                +{participants.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h2 className="text-xl font-semibold">
          {callMode === "direct" && partner?.name}
          {callMode === "group" && "Group Call"}
        </h2>

        {callMode === "group" && (
          <span className="material-symbols-outlined">groups</span>
        )}

        {/* Call Type Label */}
        <div className="flex flex-col justify-center items-center gap-2 mt-10 mb-2">
          <span className="material-symbols-outlined text-6xl opacity-60">
            {callType === "voice" ? "call" : "videocam"}
          </span>
          <p className="text-sm opacity-70 capitalize">
            {callType}
            {status === "calling" && " Calling…"}
            {status === "incoming" && " Incoming Call…"}
            {status === "in-call" && " In Call"}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-4">
          {status === "incoming" && (
            <>
              <button
                onClick={() => {
                  closeModal();
                  onAccept?.();
                }}
                className="bg-[var(--primary-green)] px-4 py-2 rounded-full"
              >
                Accept
              </button>
              <button onClick={handleClose} className={cancelClasses}>
                Decline
              </button>
            </>
          )}

          {status === "calling" && (
            <button onClick={handleClose} className={cancelClasses}>
              Cancel
            </button>
          )}

          {status === "in-call" && (
            <button onClick={handleClose} className={cancelClasses}>
              End Call
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CallModal;
