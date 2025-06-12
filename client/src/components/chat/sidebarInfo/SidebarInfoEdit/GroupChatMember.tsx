import { Avatar } from "@/components/ui/avatar/Avatar";
import { OnlineDot } from "@/components/ui/OnlineDot";
import { useUserOnlineStatus } from "@/hooks/useUserOnlineStatus";
import { useCurrentUser } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";

interface MemberItemProps {
  member: {
    userId: string;
    avatarUrl?: string | null;
    firstName: string;
    lastName: string;
    nickname?: string | null;
    isBanned: boolean;
    isAdmin: boolean;
  };
}

const MemberItem: React.FC<MemberItemProps> = ({ member }) => {
  const currentUser = useCurrentUser();
  const isMemberOnline = useUserOnlineStatus(member.userId);
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
            firstName={member.firstName}
            lastName={member.lastName}
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
      {member.isBanned ? (
        <span className="material-symbols-outlined">dangerous</span>
      ) : (
        member.isAdmin && (
          <span className="material-symbols-outlined opacity-50">
            manage_accounts
          </span>
        )
      )}
    </div>
  );
};

export default MemberItem;
