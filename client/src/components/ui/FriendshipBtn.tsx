// import { useChatStore } from "@/stores/chatStore";
// import { useFriendshipStore } from "@/stores/friendshipStore";
// import { ModalType, useModalStore } from "@/stores/modalStore";
// import { FriendshipStatus } from "@shared/types/friendship-type.enum";
// import { useCurrentUserId } from "@/stores/authStore"; // Access current user
// import { toast } from "react-toastify";

// interface FriendshipBtnProps {
//   userId: string;
//   username: string;
//   firstName?: string;
//   lastName?: string;
//   avatarUrl?: string;
//   friendshipStatus?: FriendshipStatus | null;
//   onStatusChange?: (newStatus: FriendshipStatus | null) => void;
//   className?: string;
// }

// const FriendshipBtn: React.FC<FriendshipBtnProps> = ({
//   userId,
//   username,
//   firstName,
//   lastName,
//   avatarUrl,
//   friendshipStatus,
//   onStatusChange,
//   className,
// }) => {
//   const currentUserId = useCurrentUserId(); // Ensure this exists
//   const openModal = useModalStore((state) => state.openModal);
//   const pendingRequests = useFriendshipStore((state) => state.pendingRequests);
//   const respondToRequest = useFriendshipStore(
//     (state) => state.respondToRequest
//   );
//   const cancelRequest = useFriendshipStore((state) => state.cancelRequest);

//   const getDirectChatByUserId = useChatStore(
//     (state) => state.getDirectChatByUserId
//   );

//   const receivedRequest = pendingRequests.find(
//     (req) => req.sender.id === userId && req.receiver.id === currentUserId
//   );

//   const sentRequest = pendingRequests.find(
//     (req) => req.receiver.id === userId && req.sender.id === currentUserId
//   );

//   function handleOpenFriendRequest() {
//     openModal(ModalType.FRIEND_REQUEST, {
//       receiver: {
//         id: userId,
//         username,
//         firstName,
//         lastName,
//         avatarUrl,
//       },
//       onSuccess: onStatusChange,
//     });
//   }

//   async function handleAcceptRequest() {
//     if (!receivedRequest) return;
//     try {
//       await respondToRequest(
//         receivedRequest.id,
//         userId,
//         FriendshipStatus.ACCEPTED
//       );
//       toast.success(`${FriendshipStatus.ACCEPTED}`);
//       onStatusChange?.(FriendshipStatus.ACCEPTED);
//       getDirectChatByUserId(receivedRequest.sender.id);
//     } catch (error) {
//       console.error("Failed to accept friend request:", error);
//     }
//   }

//   async function handleDeclineRequest() {
//     if (!receivedRequest) return;
//     try {
//       await respondToRequest(receivedRequest.id, userId, FriendshipStatus.DECLINED);
//       onStatusChange?.(null);
//     } catch (error) {
//       console.error("Failed to decline friend request:", error);
//     }
//   }

//   async function handleCancelRequest() {
//     if (!sentRequest) return;
//     try {
//       await cancelRequest(sentRequest.id, userId);
//       onStatusChange?.(null);
//     } catch (error) {
//       console.error("Failed to cancel friend request:", error);
//     }
//   }

//   if (receivedRequest) {
//     return (
//       <div className="flex flex-col items-center custom-border p-2 rounded w-full">
//         <h1 className="font-bold">Friend Request</h1>
//         <p className="opacity-80 mt-1 mb-3">{receivedRequest.requestMessage}</p>
//         <div className="flex gap-2 w-full">
//           <button
//             className="flex-1 bg-[var(--primary-green)] px-3 py-1 text-sm"
//             onClick={handleAcceptRequest}
//           >
//             Accept
//           </button>
//           <button
//             className="flex-1 custom-border text-red-400 px-3 py-1 text-sm"
//             onClick={handleDeclineRequest}
//           >
//             Decline
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (sentRequest) {
//     return (
//       <button
//         className="w-full custom-border text-red-400 px-3 py-1 text-sm"
//         onClick={handleCancelRequest}
//       >
//         Cancel Request
//       </button>
//     );
//   }

//   switch (friendshipStatus) {
//     case null:
//     case undefined:
//       return (
//         <button
//           className={`w-full py-1 flex gap-1 justify-center hover:bg-[var(--primary-green)] ${className}`}
//           onClick={handleOpenFriendRequest}
//         >
//           <span className="material-symbols-outlined">person_add</span>
//           <span>Add Friend</span>
//         </button>
//       );

//     case FriendshipStatus.DECLINED:
//       return (
//         <button
//           className={`w-full py-1 flex gap-1 justify-center hover:bg-[var(--primary-green)] custom-border`}
//           onClick={handleOpenFriendRequest}
//         >
//           <span className="material-symbols-outlined">person_add</span>
//           <span>Add Friend Again</span>
//         </button>
//       );

//     case FriendshipStatus.BLOCKED:
//       return (
//         <button className={`w-full py-1 flex gap-1 justify-center opacity-50`}>
//           <span className="text-sm">Blocked</span>
//         </button>
//       );

//     default:
//       return null;
//   }
// };

// export default FriendshipBtn;

// src/components/FriendshipBtn.tsx
import { ModalType, useModalStore } from "@/stores/modalStore";
import { FriendshipStatus } from "@/shared/types/enums/friendship-type.enum";
import { useCurrentUserId } from "@/stores/authStore";
import { useFriendRequest } from "@/hooks/useFriendRequest";

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
  const currentUserId = useCurrentUserId();
  const openModal = useModalStore((state) => state.openModal);
  const {
    findReceivedRequest,
    findSentRequest,
    handleAccept,
    handleDecline,
    handleCancel,
  } = useFriendRequest();

  const receivedRequest = findReceivedRequest(userId, currentUserId);
  const sentRequest = findSentRequest(userId, currentUserId);

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

  if (receivedRequest) {
    return (
      <div className="flex flex-col items-center custom-border p-2 rounded w-full">
        <h1 className="font-bold">Friend Request</h1>
        <p className="opacity-80 mt-1 mb-3">{receivedRequest.requestMessage}</p>
        <div className="flex gap-2 w-full">
          <button
            className="flex-1 bg-[var(--primary-green)] px-3 py-1 text-sm"
            onClick={() =>
              handleAccept(receivedRequest.id, userId, onStatusChange)
            }
          >
            Accept
          </button>
          <button
            className="flex-1 custom-border text-red-400 px-3 py-1 text-sm"
            onClick={() =>
              handleDecline(receivedRequest.id, userId, onStatusChange)
            }
          >
            Decline
          </button>
        </div>
      </div>
    );
  }

  if (sentRequest) {
    return (
      <button
        className="w-full custom-border text-red-400 px-3 py-1 text-sm"
        onClick={() => handleCancel(sentRequest.id, userId, onStatusChange)}
      >
        Cancel Request
      </button>
    );
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
      );

    case FriendshipStatus.BLOCKED:
      return (
        <button className={`w-full py-1 flex gap-1 justify-center opacity-50`}>
          <span className="text-sm">Blocked</span>
        </button>
      );

    default:
      return null;
  }
};

export default FriendshipBtn;
