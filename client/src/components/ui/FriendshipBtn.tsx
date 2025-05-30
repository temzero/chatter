// FriendshipBtn.tsx
import { useFriendshipStore } from "@/stores/friendshipStore";
import { useModalStore } from "@/stores/modalStore";
import { FriendshipStatus } from "@/types/enums/friendshipType";

interface FriendshipBtnProps {
  userId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  friendshipStatus?: FriendshipStatus | null;
  onStatusChange?: (newStatus: FriendshipStatus | null) => void;
  className?: string;
}

const FriendshipBtn: React.FC<FriendshipBtnProps> = ({
  userId,
  username,
  firstName,
  lastName,
  avatarUrl,
  friendshipStatus,
  onStatusChange,
  className,
}) => {
  const { openModal } = useModalStore();
  const { deleteFriendshipByUserId } = useFriendshipStore();

  function handleOpenFriendRequest() {
    openModal("friend-request", {
      receiver: {
        id: userId,
        username,
        firstName,
        lastName,
        avatarUrl,
      },
      onSuccess: onStatusChange,
    });
  }

  function handleCancelRequest() {
    if (onStatusChange) {
      onStatusChange(null);
    }
    deleteFriendshipByUserId(userId);
  }

  if (!friendshipStatus) {
    return (
      <button
        className={`w-full py-1 flex gap-1 justify-center hover:bg-[var(--primary-green)] ${className}`}
        onClick={handleOpenFriendRequest}
      >
        <span className="material-symbols-outlined">person_add</span>
      </button>
    );
  } else if (friendshipStatus === FriendshipStatus.ACCEPTED) {
    return null;
  } else if (friendshipStatus === FriendshipStatus.DECLINED) {
    return (
      <button
        className={`w-full py-1 flex gap-1 justify-center hover:bg-[var(--primary-green)]`}
        onClick={handleOpenFriendRequest}
      >
        <span className="text-sm opacity-60">Add Friend</span>
      </button>
    );
  } else if (friendshipStatus === FriendshipStatus.BLOCKED) {
    return (
      <button className={`w-full py-1 flex gap-1 justify-center opacity-50`}>
        <span className="text-sm">Blocked</span>
      </button>
    );
  } else if (friendshipStatus === FriendshipStatus.PENDING) {
    return (
      <button
        className="w-full custom-border text-red-400 px-3 py-1 rounded text-sm"
        onClick={handleCancelRequest}
      >
        Cancel Friend Request
      </button>
    );
  }

  return null;
};

export default FriendshipBtn;
