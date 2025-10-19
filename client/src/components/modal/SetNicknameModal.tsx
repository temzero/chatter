import React, { useState } from "react";
import { useModalStore } from "@/stores/modalStore";
import { motion } from "framer-motion";
import { modalAnimations } from "@/common/animations/modalAnimations";
import { DirectChatMember } from "@/shared/types/responses/chat-member.response";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/buttons/Button";

const SetNicknameModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = useModalStore((state) => state.closeModal);
  const modalContent = useModalStore((state) => state.modalContent);
  const member = modalContent?.props?.member as DirectChatMember;

  const updateMemberNickname = useChatMemberStore(
    (state) => state.updateMemberNickname
  );
  const [nickname, setNickname] = useState(member?.nickname || "");
  const [loading, setLoading] = useState(false);

  if (!member) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateMemberNickname(member.chatId, member.id, nickname.trim());
      closeModal();
    } catch (err) {
      console.error(t("modal.set_nickname.failed"), err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      {...modalAnimations.children}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded max-w-xl w-[400px] custom-border"
      style={{ zIndex: 100 }}
    >
      <div className="p-4">
        <div className="flex gap-2 items-center mb-4 font-semibold">
          <span className="material-symbols-outlined text-3xl font-bold">
            edit
          </span>
          <h2 className="text-2xl">{t("modal.set_nickname.title")}</h2>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Avatar
            avatarUrl={member.avatarUrl}
            name={member.nickname || member.firstName}
          />
          <h1 className="font-medium">
            {member.firstName} {member.lastName}
          </h1>
        </div>

        <input
          id="nickname"
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="input"
          placeholder={t("modal.set_nickname.placeholder")}
          maxLength={32}
          autoFocus
        />
      </div>

      <div className="flex custom-border-t">
        <Button
          variant="ghost"
          fullWidth
          onClick={handleSave}
          className="text-green-500"
        >
          {loading ? t("common.loading.saving") : t("common.actions.save")}
        </Button>
        <Button variant="ghost" fullWidth onClick={closeModal}>
          {t("common.actions.cancel")}
        </Button>
        {/* <button
          className="p-3 text-[--primary-green] hover:bg-[var(--background-secondary)] font-semibold hover:font-bold opacity-80 hover:opacity-100 flex-1"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? t("common.loading.saving") : t("common.actions.save")}
        </button>
        <button
          className="p-3 hover:bg-[var(--background-secondary)] font-semibold hover:font-bold opacity-80 hover:opacity-100 flex-1"
          onClick={closeModal}
        >
          {t("common.actions.cancel")}
        </button> */}
      </div>
    </motion.div>
  );
};

export default SetNicknameModal;
