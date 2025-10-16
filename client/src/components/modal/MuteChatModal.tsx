import React from "react";
import { useModalStore } from "@/stores/modalStore";
import { motion } from "framer-motion";
import { modalAnimations } from "@/common/animations/modalAnimations";
import { toast } from "react-toastify";
import { formatDateTime } from "@/common/utils/formatDate";
import { useChatStore } from "@/stores/chatStore";
import { useTranslation } from "react-i18next";

interface MuteChatModalProps {
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
  const closeModal = useModalStore((state) => state.closeModal);
  const modalContent = useModalStore((state) => state.modalContent);
  const setMute = useChatStore((state) => state.setMute);
  // Add safe destructuring with default values
  const { chatId, myMemberId } =
    (modalContent?.props as unknown as MuteChatModalProps) ?? {
      chatId: "",
      myMemberId: "",
    };

  const handleMute = async (duration: number) => {
    try {
      const mutedUntil = new Date(Date.now() + duration * 1000);
      await setMute(chatId, myMemberId, mutedUntil);
      toast.success(
        t("modal.mute_chat.muted_until", { time: formatDateTime(mutedUntil) })
      );
    } catch (error) {
      console.error("Failed to mute chat member:", error);
      toast.error(t("modal.mute_chat.mute_failed"));
    } finally {
      closeModal();
    }
  };

  return (
    <motion.div
      {...modalAnimations.children}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded max-w-xl w-[400px] custom-border"
      style={{ zIndex: 100 }}
    >
      <div className="p-4 flex flex-col items-center justify-center">
        <h2 className="text-2xl flex items-center justify-center gap-2 font-semibold mb-4 text-yellow-500">
          <span className="material-symbols-outlined text-3xl">
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
    </motion.div>
  );
};

export default MuteChatModal;
