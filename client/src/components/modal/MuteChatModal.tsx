import React from "react";
import { useModalStore } from "@/stores/modalStore";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { toast } from "react-toastify";
import { formatDateTime } from "@/utils/formatDate";
import { useChatStore } from "@/stores/chatStore";

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
      toast.success(`Muted until ${formatDateTime(mutedUntil)}`);
    } catch (error) {
      console.error("Failed to mute chat member:", error);
      toast.error("Failed to mute chat member");
    } finally {
      closeModal();
    }
  };

  if (!modalContent?.props) {
    closeModal();
    return null;
  }

  return (
    <motion.div
      {...childrenModalAnimation}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded max-w-xl w-[400px] custom-border z-[99]"
    >
      <div className="p-4">
        <h2 className="text-2xl font-semibold mb-4 text-yellow-500">
          Mute Chat
        </h2>
        <p className="mb-4 text-sm opacity-70">
          Choose how long to mute notifications:
        </p>
        <div className="flex flex-col gap-2">
          {MUTE_OPTIONS.map((option) => (
            <button
              key={option.label}
              className="p-1 rounded custom-border w-full hover:bg-[--primary-green]"
              onClick={() => handleMute(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MuteChatModal;
