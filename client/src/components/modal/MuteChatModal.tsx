import * as React from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { toast } from "react-toastify";
import { formatDateTime } from "@/common/utils/format/formatDateTime";
import { useChatStore } from "@/stores/chatStore";
import { useTranslation } from "react-i18next";
import { handleError } from "@/common/utils/error/handleError";

interface MuteChatModalData {
  chatId: string;
  myMemberId: string;
}

const MUTE_OPTIONS = [
  { label: "1 Hour", value: 3600 },
  { label: "8 Hours", value: 8 * 3600 },
  { label: "1 Day", value: 86400 },
  { label: "1 Week", value: 7 * 86400 },
  { label: "1 Month", value: 4 * 7 * 86400 },
  { label: "Forever", value: 100 * 365 * 86400 },
];

const MuteChatModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = getCloseModal();
  const setMute = useChatStore.getState().setMute;
  const data = getModalData() as unknown as MuteChatModalData | undefined;

  const chatId = data?.chatId;
  const myMemberId = data?.myMemberId;

  if (!chatId || !myMemberId) return null;

  const handleMute = async (duration: number) => {
    try {
      const mutedUntil = new Date(Date.now() + duration * 1000);
      setMute(chatId, myMemberId, mutedUntil);
      toast.success(
        t("modal.mute_chat.muted_until", { time: formatDateTime(mutedUntil) })
      );
    } catch (error) {
      handleError(error, t("modal.mute_chat.mute_failed"));
    } finally {
      closeModal();
    }
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center">
      <h2 className="text-2xl flex items-center justify-center gap-2 font-semibold mb-4 text-yellow-500">
        <span className="material-symbols-outlined text-3xl!">
          notifications_off
        </span>
        {t("modal.mute_chat.title")}
      </h2>
      <p className="mb-4 text-sm opacity-70">
        {t("modal.mute_chat.description")}
      </p>
      <div className="flex flex-col gap-2 w-full">
        {MUTE_OPTIONS.map((option) => (
          <button
            key={option.label}
            className="p-1 rounded custom-border w-full hover:bg-[--hover-color]"
            onClick={() => handleMute(option.value)}
          >
            {t(
              `modal.mute_chat.options.${option.label
                .replace(" ", "_")
                .toLowerCase()}`
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MuteChatModal;
