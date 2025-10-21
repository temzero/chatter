import { Avatar } from "@/components/ui/avatar/Avatar";
import { OnlineDot } from "@/components/ui/icons/OnlineDot";
import { useCurrentUser } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useUserStatus } from "@/stores/presenceStore";
import { GroupChatMember } from "@/shared/types/responses/chat-member.response";
import { ChatMemberStatus } from "@/shared/types/enums/chat-member-status.enum";

interface MemberItemProps {
  member: GroupChatMember;
}

const MemberItem: React.FC<MemberItemProps> = ({ member }) => {
  const currentUser = useCurrentUser();
  const isMemberOnline = useUserStatus(member.userId);
  const createOrGetDirectChat = useChatStore.getState().createOrGetDirectChat;

  const isCurrentUser = currentUser?.id === member.userId;
  const isBlockedByMe = member.isBlockedByMe;
  const hasBlockedMe = member.isBlockedMe;
  const isBlocked = isBlockedByMe || hasBlockedMe;

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
      <div className="flex relative gap-2 items-center">
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
            className="absolute -left-1.5 top-1/2 -translate-y-1/2"
          />
        )}
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
      {!showBlockedContent && member.status === ChatMemberStatus.BANNED && (
        <span className="material-symbols-outlined">dangerous</span>
      )}
    </div>
  );
};

export default MemberItem;
