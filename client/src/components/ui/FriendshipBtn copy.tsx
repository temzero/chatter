// FriendshipBtn.tsx
import { useChatStore } from "@/stores/chatStore";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { ModalType, useModalStore } from "@/stores/modalStore";
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
  const openModal = useModalStore((state) => state.openModal);
  const {
    receivedRequests,
    sentRequests,
    respondToRequest,
    removeRequest,
    // deleteFriendshipByUserId,
  } = useFriendshipStore();

  const getDirectChatByUserId = useChatStore(
    (state) => state.getDirectChatByUserId
  );
  // Check if this is an incoming request
  const incomingRequest = receivedRequests.find(
    (req) => req.senderId === userId
  );

  // Check if this is an outgoing request
  const outgoingRequest = sentRequests.find((req) => req.receiverId === userId);

  function handleOpenFriendRequest() {
    openModal(ModalType.FRIEND_REQUEST, {
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

  async function handleAcceptRequest() {
    if (!incomingRequest) return;
    try {
      await respondToRequest(incomingRequest.id, FriendshipStatus.ACCEPTED);
      onStatusChange?.(FriendshipStatus.ACCEPTED);
      getDirectChatByUserId(incomingRequest.senderId);
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  }

  async function handleDeclineRequest() {
    if (!incomingRequest) return;
    try {
      await respondToRequest(incomingRequest.id, FriendshipStatus.DECLINED);
      onStatusChange?.(null);
      getDirectChatByUserId(incomingRequest.senderId);
    } catch (error) {
      console.error("Failed to decline friend request:", error);
    }
  }

  async function handleCancelRequest() {
    if (!outgoingRequest) return;
    try {
      await removeRequest(outgoingRequest.id);
      onStatusChange?.(null);
      getDirectChatByUserId(outgoingRequest.receiverId);
    } catch (error) {
      console.error("Failed to cancel friend request:", error);
    }
  }

  switch (friendshipStatus) {
    case null:
    case undefined:
      return (
        <button
          className={`w-full py-1 flex gap-1 justify-center hover:bg-[var(--primary-green)] ${className}`}
          onClick={handleOpenFriendRequest}
        >
          <span className="material-symbols-outlined">person_add</span>
          <span>Add Friend</span>
        </button>
      );

    case FriendshipStatus.DECLINED:
      return (
        <button
          className={`w-full py-1 flex gap-1 justify-center hover:bg-[var(--primary-green)] custom-border`}
          onClick={handleOpenFriendRequest}
        >
          <span className="material-symbols-outlined">person_add</span>
          <span>Add Friend Again</span>
        </button>
        // <div className="flex flex-col gap-2 items-center justify-center w-full">
        //   <h1 className="text-sm text-red-400">Friendship Declined</h1>
        //   <button
        //     className="text-sm text-blue-400 mt-1 custom-border w-full py-1"
        //     onClick={handleOpenFriendRequest}
        //   >
        //     Try again
        //   </button>
        // </div>
      );

    case FriendshipStatus.BLOCKED:
      return (
        <button className={`w-full py-1 flex gap-1 justify-center opacity-50`}>
          <span className="text-sm">Blocked</span>
        </button>
      );

    case FriendshipStatus.PENDING:
      if (incomingRequest) {
        return (
          <div className="flex flex-col items-center custom-border p-2 rounded w-full">
            <h1 className="font-bold">Friend Request</h1>
            <p className="opacity-80 mt-1 mb-3">
              {incomingRequest.requestMessage}
            </p>
            <div className="flex gap-2 w-full">
              <button
                className="flex-1 bg-[var(--primary-green)] px-3 py-1 text-sm"
                onClick={handleAcceptRequest}
              >
                Accept
              </button>
              <button
                className="flex-1 custom-border text-red-400 px-3 py-1 text-sm"
                onClick={handleDeclineRequest}
              >
                Decline
              </button>
            </div>
          </div>
        );
      } else {
        return (
          <button
            className="w-full custom-border text-red-400 px-3 py-1 text-sm"
            onClick={handleCancelRequest}
          >
            Cancel Request
          </button>
        );
      }

    // case FriendshipStatus.ACCEPTED:
    //   return (
    //     <div className="flex flex-col items-center w-full">
    //       <h1 className="w-full text-sm text-center text-[var(--primary-green)] mb-2">
    //         Friends
    //       </h1>
    //       <button
    //         className="w-full custom-border text-red-400 px-3 py-1 text-sm"
    //         onClick={handleRemoveFriend}
    //       >
    //         Remove Friend
    //       </button>
    //     </div>
    //   );

    default:
      return null;
  }
};

export default FriendshipBtn;
