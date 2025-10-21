import { useChatStore } from "@/stores/chatStore";
import { useSidebarInfoStore } from "@/stores/sidebarInfoStore";
import { ChatResponse } from "@/shared/types/responses/chat.response";
import { useActiveMembers } from "@/stores/chatMemberStore";
import { ModalType, getOpenModal } from "@/stores/modalStore";
import { SidebarInfoMode } from "@/common/enums/sidebarInfoMode";
import { GroupChatMember } from "@/shared/types/responses/chat-member.response";
import { useCurrentUserId } from "@/stores/authStore";
import { ChatMemberRole } from "@/shared/types/enums/chat-member-role.enum";
import { ChatMemberItems } from "./ChatMemberItems";
import { useTranslation } from "react-i18next";

const ChatMembersEdit = () => {
  const { t } = useTranslation();
  const currentUserId = useCurrentUserId();
  const activeChat = useChatStore((state) => state.activeChat) as ChatResponse;
  const activeMembers = useActiveMembers();
  const setSidebarInfo = useSidebarInfoStore.getState().setSidebarInfo;
  const openModal = getOpenModal();

  const myMember = activeMembers?.find(
    (member) => member.userId === currentUserId
  ) as GroupChatMember;

  if (!activeChat || !activeMembers || !myMember) return null;

  const handleOpenAddMemberModal = () => {
    openModal(ModalType.ADD_MEMBER, {
      chatId: activeChat.id,
    });
  };

  return (
    <aside className="relative w-full h-full overflow-hidden flex flex-col">
      <header className="flex w-full justify-between px-2 items-center min-h-[var(--header-height)] custom-border-b">
        <h1 className="text-xl font-semibold ml-2">
          {t("sidebar_info.group_edit.members")} ({activeMembers.length})
        </h1>
        <button
          className="flex items-center rounded-full p-2 cursor-pointer opacity-70 hover:opacity-80 h-10 w-10 hover:bg-[var(--hover-color)]"
          onClick={() => setSidebarInfo(SidebarInfoMode.DEFAULT)}
          aria-label="Close editor"
        >
          <i className="material-symbols-outlined">close</i>
        </button>
      </header>

      <div className="overflow-y-auto h-screen p-4">
        {activeMembers.length > 0 && (
          <ChatMemberItems
            chatId={activeChat.id}
            members={activeMembers}
            currentUserId={currentUserId}
          />
        )}

        <div className="custom-border absolute left-0 bottom-0 w-full overflow-hidden shadow-xl rounded-t-xl">
          {(myMember.role === ChatMemberRole.ADMIN ||
            myMember.role === ChatMemberRole.OWNER) && (
            <button
              className="flex gap-2 justify-center items-center p-2 text-[--primary-green] w-full font-medium custom-border-t"
              onClick={handleOpenAddMemberModal}
            >
              <span className="material-symbols-outlined">person_add</span>
              {t("sidebar_info.members_edit.add_member")}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default ChatMembersEdit;
