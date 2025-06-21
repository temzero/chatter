import { Avatar } from "@/components/ui/avatar/Avatar";
import { OnlineDot } from "@/components/ui/OnlineDot";
import { useCurrentUser } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useUserStatus } from "@/stores/presenceStore";
import { GroupChatMember } from "@/types/chatMember";
import { ChatMemberRole } from "@/types/ChatMemberRole";
import { ChatMemberStatus } from "@/types/enums/chatMemberStatus";

interface MemberItemProps {
  member: GroupChatMember;
}

const MemberItem: React.FC<MemberItemProps> = ({ member }) => {
  const currentUser = useCurrentUser();
  const isMemberOnline = useUserStatus(member.userId);
  const { createOrGetDirectChat } = useChatStore();

  const isCurrentUser = currentUser?.id === member.userId;

  return (
    <div
      className="flex items-center justify-between hover:bg-[var(--hover-color)] p-2 cursor-pointer"
      onClick={() => createOrGetDirectChat(member.userId)}
    >
      <div className="flex gap-2 items-center">
        <div className="relative">
          <Avatar
            avatarUrl={member.avatarUrl}
            name={member.firstName}
            size="8"
            textSize="sm"
            className="transform transition-transform duration-300 hover:scale-125"
          />
          <OnlineDot
            isOnline={isMemberOnline}
            className="absolute bottom-[2px] right-[2px]"
          />
        </div>
        <h1 className={`text-sm ${isCurrentUser ? "text-green-500" : ""}`}>
          {member.nickname || `${member.firstName} ${member.lastName}`}
        </h1>
      </div>
      {member.status === ChatMemberStatus.BANNED ? (
        <span className="material-symbols-outlined">dangerous</span>
      ) : (
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
