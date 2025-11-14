import React, { useCallback } from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { callService } from "@/services/http/callService";
import { CallResponse } from "@/shared/types/responses/call.response";
import { ChatAvatar } from "@/components/ui/avatar/ChatAvatar";
import { getCallStatusColor } from "@/common/utils/call/callHelpers";
import { formatDateTime } from "@/common/utils/format/formatDateTime";
import { useTranslation } from "react-i18next";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { getCallStatusText } from "@/common/utils/call/callTextHelpers";
import CallIcon from "@/components/ui/icons/CallIcon";
import Button from "../ui/buttons/Button";

interface DeleteCallModalData {
  call: CallResponse;
  onDeleted?: () => void;
}

const DeleteCallModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = getCloseModal();
  const data = getModalData() as unknown as DeleteCallModalData | undefined;

  // Memoized delete handler - MUST be called unconditionally
  const handleDelete = useCallback(async () => {
    if (!data?.call) return; // Add guard inside the callback

    try {
      await callService.deleteCall(data.call.id);
      data.onDeleted?.();
      closeModal();
    } catch (err) {
      console.error("Failed to delete call:", err);
      alert(t("modal.delete_call.descripfailed"));
    }
  }, [data, closeModal, t]);

  // Early return after all hooks
  if (!data?.call) return null;

  const { call } = data;
  const callText = getCallStatusText(
    t,
    call.status,
    call.startedAt,
    call.endedAt
  );
  const callColor = getCallStatusColor(call.status);
  const formattedDate = formatDateTime(call.createdAt);

  const isChannel = call.chat.type === ChatType.CHANNEL;

  return (
    <>
      <div className="p-4">
        <div className="flex gap-2 items-center mb-4 text-red-500 font-semibold">
          <span className="material-symbols-outlined text-3xl font-bold">
            delete
          </span>
          <h2 className="text-2xl">{t("modal.delete_call.title")}</h2>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <ChatAvatar chat={call.chat} />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">
              {call.chat.name || t("common.message.unknown")}
            </p>
            <p className={`${callColor} truncate`}>{callText}</p>
            <p className="text-xs text-muted-foreground opacity-50">
              {formattedDate}
            </p>
          </div>
          <CallIcon
            status={call.status}
            isBroadcast={isChannel}
            className="group-hover:hidden text-4xl flex-shrink-0"
          />
        </div>

        <p className="mb-6 text-sm opacity-70">
          {t("modal.delete_call.description")}
        </p>
      </div>

      <div className="flex custom-border-t">
        <Button
          variant="ghost"
          fullWidth
          onClick={handleDelete}
          className="text-red-500"
        >
          {t("common.actions.delete")}
        </Button>
        <Button variant="ghost" fullWidth onClick={closeModal}>
          {t("common.actions.cancel")}
        </Button>
      </div>
    </>
  );
};

export default React.memo(DeleteCallModal);
