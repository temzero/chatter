import { Avatar } from "@/components/ui/avatar/Avatar";
import { OnlineDot } from "@/components/ui/OnlineDot";
import { useCurrentUser } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useUserStatus } from "@/stores/presenceStore";
import { GroupChatMember } from "@/types/responses/chatMember.response";
import { ChatMemberRole } from "@/types/enums/ChatMemberRole";
import { ChatMemberStatus } from "@/types/enums/chatMemberStatus";

interface MemberItemProps {
  member: GroupChatMember;
}

const MemberItem: React.FC<MemberItemProps> = ({ member }) => {
  const currentUser = useCurrentUser();
  const isMemberOnline = useUserStatus(member.userId);
  const { createOrGetDirectChat } = useChatStore();

  const isCurrentUser = currentUser?.id === member.userId;
  const isBlockedByMe = member.isBlockedByMe;
  const hasBlockedMe = member.isBlockedMe;
  const isBlocked = isBlockedByMe || hasBlockedMe;

  // When user has blocked you, we might not get their profile info
  const showBlockedContent = hasBlockedMe && !member.firstName;

  const handleClick = () => {
    if (!isBlocked) {
      createOrGetDirectChat(member.userId);
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-2 ${
        !isBlocked
          ? "hover:bg-[var(--hover-color)] cursor-pointer"
          : "opacity-70"
      }`}
      onClick={handleClick}
    >
      <div className="flex gap-2 items-center">
        <div className="relative flex items-center justify-center select-none">
          <Avatar
            avatarUrl={member.avatarUrl}
            name={showBlockedContent ? undefined : member.firstName}
            size="8"
            textSize="sm"
            isBlocked={isBlocked}
            className={`transform transition-transform duration-300 ${
              !isBlocked && "hover:scale-125"
            }`}
          />

          {!isBlocked && isMemberOnline && (
            <OnlineDot
              isOnline={isMemberOnline}
              className="absolute bottom-[2px] right-[2px]"
            />
          )}
        </div>
        <h1
          className={`text-sm ${
            isCurrentUser ? "text-green-500" : isBlocked ? "text-red-400" : ""
          }`}
        >
          {showBlockedContent
            ? "Blocked User"
            : member.nickname || `${member.firstName} ${member.lastName}`}
          {hasBlockedMe && !showBlockedContent && " (Blocked you)"}
        </h1>
      </div>
      {!showBlockedContent && member.status === ChatMemberStatus.BANNED ? (
        <span className="material-symbols-outlined">dangerous</span>
      ) : (
        !showBlockedContent &&
        member.role === ChatMemberRole.ADMIN && (
          <span className="material-symbols-outlined opacity-50">
            manage_accounts
          </span>
        )
      )}
    </div>
  );
};

export default MemberItem;
