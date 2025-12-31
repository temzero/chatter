import * as React from "react";
import { handleError } from "@/common/utils/error/handleError";
import { ChatMemberRole } from "@/shared/types/enums/chat-member-role.enum";
import { ChatMemberResponse } from "@/shared/types/responses/chat-member.response";
import { getCurrentUserId } from "@/stores/authStore";
import { useChatMemberStore } from "@/stores/chatMemberStore";
import { getOpenModal, ModalType } from "@/stores/modalStore";
import { useTranslation } from "react-i18next";
import { Portal } from "../Portal";

interface ContextMenuProps {
  x: number;
  y: number;
  member: ChatMemberResponse;
  currentRole: ChatMemberRole;
  onClose: () => void;
  chatMemberRoleMap: Record<ChatMemberRole, { icon: string; label?: string }>;
}

const MemberContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(
  ({ x, y, member, currentRole, onClose, chatMemberRoleMap }, ref) => {
    const { t } = useTranslation();
    const currentUserId = getCurrentUserId();
    const openModal = getOpenModal();
    const updateMember = useChatMemberStore.getState().updateMember;
    const removeMember = useChatMemberStore.getState().removeChatMember;

    const classes =
      "flex items-center gap-2 p-2 hover:bg-(--hover-color) truncate cursor-pointer z-99";

    const isMyself = member.userId === currentUserId;
    const canManageOthers =
      currentRole === ChatMemberRole.OWNER ||
      currentRole === ChatMemberRole.ADMIN;

    const handleOpenNicknameModal = () => {
      openModal(ModalType.SET_NICKNAME, { member });
      onClose();
    };

    const handleChangeRole = (role: ChatMemberRole) => {
      try {
        updateMember(member.chatId, member.id, { role });
        onClose();
      } catch (error) {
        handleError(error, "failed to change role");
      }
    };

    const handleRemoveMember = () => {
      try {
        removeMember(member.chatId, member.userId);
        onClose();
      } catch (error) {
        handleError(error, "Remove member failed");
      }
    };

    const availableRoles =
      currentRole === ChatMemberRole.OWNER
        ? [ChatMemberRole.OWNER, ChatMemberRole.ADMIN, ChatMemberRole.MEMBER]
        : currentRole === ChatMemberRole.ADMIN
        ? [ChatMemberRole.MEMBER]
        : [];

    return (
      <Portal>
        <div
          ref={ref}
          className="context-menu"
          style={{ zIndex: 999!, top: `${y}px`, left: `${x}px` }}
          onContextMenu={(e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {(isMyself || canManageOthers) && (
            <div className={classes} onClick={handleOpenNicknameModal}>
              <span className="material-symbols-outlined">edit</span>
              {t("context_menu.chat_member.set_nickname")}
            </div>
          )}

          {!isMyself && canManageOthers && (
            <>
              {availableRoles
                .filter((role) => role !== member.role) // skip current role
                .map((role) => {
                  const roleInfo = chatMemberRoleMap[role];

                  return (
                    <div
                      key={role}
                      className={classes}
                      onClick={() => handleChangeRole(role)}
                    >
                      <span className="material-symbols-outlined">
                        {roleInfo.icon}
                      </span>
                      {t(`context_menu.chat_member.set_${role.toLowerCase()}`)}
                    </div>
                  );
                })}

              <div
                className={`${classes} text-red-500`}
                onClick={handleRemoveMember}
              >
                <span className="material-symbols-outlined">
                  delete_forever
                </span>
                {t("common.actions.delete")}
              </div>
            </>
          )}
        </div>
      </Portal>
    );
  }
);

export default MemberContextMenu;
