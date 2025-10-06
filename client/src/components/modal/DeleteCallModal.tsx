import React from "react";
import { useModalStore } from "@/stores/modalStore";
import { callService } from "@/services/callService";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { CallResponseDto } from "@/types/responses/call.response";
import { ChatAvatar } from "../ui/avatar/ChatAvatar";
import { getCallColor, getCallText } from "@/utils/callHelpers";
import { formatDateTime } from "@/utils/formatDate";
import { useCurrentUserId } from "@/stores/authStore";
import CallIcon from "../ui/CallIcon";
import { useTranslation } from "react-i18next";

const DeleteCallModal: React.FC = () => {
  const { t } = useTranslation();
  const currentUserId = useCurrentUserId();
  const { modalContent, closeModal } = useModalStore();

  if (!modalContent?.props) return null;

  const { call } = modalContent.props as {
    call: CallResponseDto;
    onDeleted?: () => void;
  };

  const callId = call.id;
  const onDeleted = modalContent.props.onDeleted as (() => void) | undefined;

  const handleDelete = async () => {
    try {
      await callService.deleteCall(callId);
      if (onDeleted) onDeleted();
      closeModal();
    } catch (err) {
      console.error(err);
      alert(t("modal.delete_call.descripfailed"));
    }
  };

  return (
    <motion.div
      {...childrenModalAnimation}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded max-w-xl w-[400px] custom-border z-[99]"
    >
      <div className="p-4">
        <div className="flex gap-2 items-center mb-4 text-red-500 font-semibold">
          <span className="material-symbols-outlined text-3xl font-bold">
            delete
          </span>
          <h2 className="text-2xl">{t("modal.delete_call.title")}</h2>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <ChatAvatar chat={call.chat} />
          <div className="flex-1">
            <p className="font-medium">
              {call.chat.name || t("common.message.unknown")}
            </p>
            <p className={`${getCallColor(call.status)}`}>
              {getCallText(call.status, call.startedAt, call.endedAt)}
            </p>
            <p className="text-xs text-muted-foreground opacity-50">
              {formatDateTime(call.createdAt)}
            </p>
          </div>
          <CallIcon
            status={call.status}
            isCaller={call.initiator.userId === currentUserId}
            className="group-hover:hidden text-4xl"
          />
        </div>

        <p className="mb-6 text-sm opacity-70">{t("modal.delete_call.description")}</p>
      </div>

      <div className="flex custom-border-t">
        <button
          className="p-3 text-red-500 hover:bg-[var(--background-secondary)] font-semibold hover:font-bold opacity-80 hover:opacity-100 flex-1"
          onClick={handleDelete}
        >
          {t("common.actions.delete")}
        </button>
        <button
          className="p-3 hover:bg-[var(--background-secondary)] font-semibold hover:font-bold opacity-80 hover:opacity-100 flex-1"
          onClick={closeModal}
        >
          {t("common.actions.cancel")}
        </button>
      </div>
    </motion.div>
  );
};

export default DeleteCallModal;
