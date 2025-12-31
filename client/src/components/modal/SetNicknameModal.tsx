// import React, { useState } from "react";
// import { getCloseModal, getModalData } from "@/stores/modalStore";
// import { ChatMemberResponse } from "@/shared/types/responses/chat-member.response";
// import { Avatar } from "@/components/ui/avatar/Avatar";
// import { useChatMemberStore } from "@/stores/chatMemberStore";
// import { useTranslation } from "react-i18next";
// import Button from "../ui/buttons/Button";

// interface SetNicknameModalData {
//   member: ChatMemberResponse;
// }

// const SetNicknameModal: React.FC = () => {
//   const { t } = useTranslation();
//   const closeModal = getCloseModal();

//   const data = getModalData() as unknown as SetNicknameModalData | undefined;
//   const updateMemberNickname =
//     useChatMemberStore.getState().updateMemberNickname;
//   const member = data?.member;
//   const [nickname, setNickname] = useState(member?.nickname || "");
//   const [loading, setLoading] = useState(false);

//   if (!member) return null;

//   const handleSave = async () => {
//     try {
//       setLoading(true);
//       await updateMemberNickname(member.chatId, member.id, nickname.trim());
//       closeModal();
//     } catch (err) {
//       console.error(t("modal.set_nickname.failed"), err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <div className="p-4">
//         <div className="flex gap-2 items-center mb-4 font-semibold">
//           <span className="material-symbols-outlined text-3xl! font-bold">
//             edit
//           </span>
//           <h2 className="text-2xl">{t("modal.set_nickname.title")}</h2>
//         </div>

//         <div className="flex items-center gap-3 mb-6">
//           <Avatar
//             avatarUrl={member.avatarUrl}
//             name={member.nickname || member.firstName}
//           />
//           <h1 className="font-medium">
//             {member.firstName} {member.lastName}
//           </h1>
//         </div>

//         <input
//           id="nickname"
//           type="text"
//           value={nickname}
//           onChange={(e) => setNickname(e.target.value)}
//           className="input-container"
//           placeholder={t("modal.set_nickname.placeholder")}
//           maxLength={32}
//           autoFocus
//         />
//       </div>

//       <div className="flex custom-border-t">
//         <Button
//           variant="ghost"
//           fullWidth
//           onClick={handleSave}
//           className="text-green-500"
//         >
//           {loading ? t("common.loading.saving") : t("common.actions.save")}
//         </Button>
//         <Button variant="ghost" fullWidth onClick={closeModal}>
//           {t("common.actions.cancel")}
//         </Button>
//       </div>
//     </>
//   );
// };

// export default SetNicknameModal;

import React, { useState } from "react";
import { getCloseModal, getModalData } from "@/stores/modalStore";
import { ChatMemberResponse } from "@/shared/types/responses/chat-member.response";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "./layout/ConfirmDialog";

interface SetNicknameModalData {
  member: ChatMemberResponse;
}

const SetNicknameModal: React.FC = () => {
  const { t } = useTranslation();
  const closeModal = getCloseModal();

  const data = getModalData() as unknown as SetNicknameModalData;
  const member = data?.member;

  const updateMemberNickname =
    useChatMemberStore.getState().updateMemberNickname;

  const [nickname, setNickname] = useState(member?.nickname ?? "");
  const [loading, setLoading] = useState(false);

  if (!member) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateMemberNickname(
        member.chatId,
        member.id,
        nickname.trim()
      );
      closeModal();
    } catch (err) {
      console.error(t("modal.set_nickname.failed"), err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfirmDialog
      title={t("modal.set_nickname.title")}
      confirmText={
        loading
          ? t("common.loading.saving")
          : t("common.actions.save")
      }
      icon={
        <span className="material-symbols-outlined text-3xl font-bold">
          edit
        </span>
      }
      onGreenAction={handleSave}
    >
      {/* ===== MEMBER INFO ===== */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar
          avatarUrl={member.avatarUrl}
          name={member.nickname || member.firstName}
        />
        <h1 className="font-medium">
          {member.firstName} {member.lastName}
        </h1>
      </div>

      {/* ===== INPUT ===== */}
      <input
        id="nickname"
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="input-container w-full"
        placeholder={t("modal.set_nickname.placeholder")}
        maxLength={32}
        autoFocus
      />
    </ConfirmDialog>
  );
};

export default SetNicknameModal;

