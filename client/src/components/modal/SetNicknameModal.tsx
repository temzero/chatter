import React, { useState } from "react";
import { useModalStore } from "@/stores/modalStore";
import { motion } from "framer-motion";
import { childrenModalAnimation } from "@/animations/modalAnimations";
import { DirectChatMember } from "@/types/responses/chatMember.response";
import { Avatar } from "../ui/avatar/Avatar";
import { useChatMemberStore } from "@/stores/chatMemberStore";

const SetNicknameModal: React.FC = () => {
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
      console.error("Failed to update nickname", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      {...childrenModalAnimation}
      className="bg-[var(--sidebar-color)] text-[var(--text-color)] rounded max-w-xl w-[400px] custom-border z-[99]"
    >
      <div className="p-4">
        <div className="flex gap-2 items-center mb-4 font-semibold">
          <span className="material-symbols-outlined text-3xl font-bold">
            edit
          </span>
          <h2 className="text-2xl">Set Nickname</h2>
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
          placeholder="Enter nickname"
          maxLength={32}
          autoFocus
        />
      </div>

      <div className="flex custom-border-t">
        <button
          className="p-3 text-[--primary-green] hover:bg-[var(--background-secondary)] font-semibold hover:font-bold opacity-80 hover:opacity-100 flex-1"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          className="p-3 hover:bg-[var(--background-secondary)] font-semibold hover:font-bold opacity-80 hover:opacity-100 flex-1"
          onClick={closeModal}
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
};

export default SetNicknameModal;
