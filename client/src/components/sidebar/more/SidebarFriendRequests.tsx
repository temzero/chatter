// import React, { useState } from "react";
// import { Avatar } from "../../ui/avatar/Avatar";
// import { formatTimeAgo } from "../../../utils/formatTimeAgo";
// import { useFriendshipStore } from "@/stores/friendshipStore";
// import { FriendshipStatus } from "@/types/enums/friendshipType";
// import { SlidingContainer } from "../../ui/SlidingContainer";
// import { useChatStore } from "@/stores/chatStore";
// import SidebarLayout from "@/pages/SidebarLayout";
// import { useCurrentUserId } from "@/stores/authStore"; // Assuming this holds current user info

// type RequestTab = "received" | "sent";

// const SidebarFriendRequests: React.FC = () => {
//   const currentUserId = useCurrentUserId();
//   const createOrGetDirectChat = useChatStore(
//     (state) => state.createOrGetDirectChat
//   );
//   const getDirectChatByUserId = useChatStore(
//     (state) => state.getDirectChatByUserId
//   );

//   const pendingRequests = useFriendshipStore((state) => state.pendingRequests);
//   const respondToRequest = useFriendshipStore(
//     (state) => state.respondToRequest
//   );
//   const cancelRequest = useFriendshipStore((state) => state.cancelRequest);

//   const [activeTab, setActiveTab] = useState<RequestTab>("received");
//   const [direction, setDirection] = useState<number>(1);

//   const handleTabChange = (tab: RequestTab) => {
//     if (tab === activeTab) return;
//     setDirection(tab === "received" ? -1 : 1);
//     setActiveTab(tab);
//   };

//   const handleAcceptRequest = async (requestId: string, senderId: string) => {
//     await respondToRequest(requestId, senderId, FriendshipStatus.ACCEPTED);
//     getDirectChatByUserId(senderId);
//   };

//   const handleDeclineRequest = async (requestId: string) => {
//     await respondToRequest(requestId, requestId, FriendshipStatus.DECLINED);
//   };

//   const handleCancelRequest = async (requestId: string) => {
//     await cancelRequest(requestId);
//   };

//   const receivedRequests = pendingRequests.filter(
//     (req) => req.receiver.id === currentUserId
//   );
//   const sentRequests = pendingRequests.filter(
//     (req) => req.sender.id === currentUserId
//   );

//   return (
//     <SidebarLayout title="Friend Requests">
//       {/* Tabs */}
//       <div className="flex custom-border-b">
//         <button
//           className={`flex-1 py-3 font-medium ${
//             activeTab === "received" ? "text-green-400" : "opacity-60"
//           }`}
//           onClick={() => handleTabChange("received")}
//         >
//           Requests {receivedRequests.length > 0 && receivedRequests.length}
//         </button>
//         <button
//           className={`flex-1 py-3 font-medium ${
//             activeTab === "sent" ? "text-green-400" : "opacity-60"
//           }`}
//           onClick={() => handleTabChange("sent")}
//         >
//           Sent {sentRequests.length > 0 && sentRequests.length}
//         </button>
//       </div>

//       {/* Content */}
//       <SlidingContainer uniqueKey={activeTab} direction={direction}>
//         <div className="overflow-x-hidden overflow-y-auto flex-1">
//           {activeTab === "received" ? (
//             receivedRequests.length > 0 ? (
//               receivedRequests.map((request) => {
//                 const firstName = request.sender.name.split(" ")[0];

//                 return (
//                   <div
//                     key={request.id}
//                     className="flex p-3 gap-4 w-full custom-border-b cursor-pointer"
//                     onClick={() => createOrGetDirectChat(request.sender.id)}
//                   >
//                     <Avatar
//                       avatarUrl={request.sender.avatarUrl}
//                       name={firstName}
//                       size="12"
//                       className="mt-1"
//                     />

//                     <div className="flex flex-col flex-1 gap-1">
//                       <div className="flex justify-between items-center">
//                         <h1 className="font-semibold">{request.sender.name}</h1>
//                         <p className="text-xs opacity-60">
//                           {formatTimeAgo(request.updatedAt)}
//                         </p>
//                       </div>
//                       {request.mutualFriends > 0 && (
//                         <p className="text-sm opacity-40">
//                           {request.mutualFriends} mutual friend
//                           {request.mutualFriends !== 1 ? "s" : ""}
//                         </p>
//                       )}

//                       {request.requestMessage && (
//                         <p className="text-sm opacity-60 italic">
//                           {request.requestMessage}
//                         </p>
//                       )}

//                       <div className="flex gap-2 mt-2">
//                         <button
//                           className="bg-[var(--primary-green)] px-3 py-1 rounded text-sm"
//                           onClick={(e) => {
//                             e.preventDefault();
//                             e.stopPropagation();
//                             handleAcceptRequest(request.id, request.sender.id);
//                           }}
//                         >
//                           Accept
//                         </button>
//                         <button
//                           className="custom-border hover:bg-red-500 px-3 py-1 rounded text-sm"
//                           onClick={(e) => {
//                             e.preventDefault();
//                             e.stopPropagation();
//                             handleDeclineRequest(request.id);
//                           }}
//                         >
//                           Decline
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="flex flex-col items-center justify-center mt-8 opacity-60">
//                 <i className="material-symbols-outlined text-6xl mb-4">
//                   person_add
//                 </i>
//                 <p>No friend requests</p>
//               </div>
//             )
//           ) : sentRequests.length > 0 ? (
//             sentRequests.map((request) => {
//               const firstName = request.receiver.name.split(" ")[0];

//               return (
//                 <div
//                   key={request.id}
//                   className="flex p-3 gap-4 w-full custom-border-b cursor-pointer"
//                 >
//                   <Avatar
//                     avatarUrl={request.receiver.avatarUrl}
//                     name={firstName}
//                     size="12"
//                     className="mt-1"
//                   />

//                   <div
//                     className="flex flex-col flex-1 gap-1"
//                     onClick={() => createOrGetDirectChat(request.receiver.id)}
//                   >
//                     <div className="flex justify-between items-center">
//                       <h1 className="font-semibold">{request.receiver.name}</h1>
//                       <p className="text-xs opacity-60">
//                         {formatTimeAgo(request.updatedAt)}
//                       </p>
//                     </div>
//                     <p className="text-sm opacity-40">
//                       {request.mutualFriends} mutual friend
//                       {request.mutualFriends !== 1 ? "s" : ""}
//                     </p>

//                     <div className="flex gap-2 mt-2">
//                       <button
//                         className="custom-border hover:bg-red-500 px-3 py-1 rounded text-sm"
//                         onClick={(e) => {
//                           e.preventDefault();
//                           e.stopPropagation();
//                           handleCancelRequest(request.id);
//                         }}
//                       >
//                         Cancel Request
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })
//           ) : (
//             <div className="flex flex-col items-center justify-center mt-8 opacity-60">
//               <i className="material-symbols-outlined text-6xl mb-4">send</i>
//               <p>No sent requests</p>
//             </div>
//           )}
//         </div>
//       </SlidingContainer>
//     </SidebarLayout>
//   );
// };

// export default SidebarFriendRequests;

// src/components/SidebarFriendRequests.tsx
import React, { useState } from "react";
import { Avatar } from "../../ui/avatar/Avatar";
import { formatTimeAgo } from "../../../utils/formatTimeAgo";
import { SlidingContainer } from "../../ui/SlidingContainer";
import SidebarLayout from "@/pages/SidebarLayout";
import { useCurrentUserId } from "@/stores/authStore";
import { useFriendRequest } from "@/hooks/useFriendRequest";
import { useChatStore } from "@/stores/chatStore";

type RequestTab = "received" | "sent";

const SidebarFriendRequests: React.FC = () => {
  const currentUserId = useCurrentUserId();
  const createOrGetDirectChat = useChatStore(
    (state) => state.createOrGetDirectChat
  );
  const { pendingRequests, handleAccept, handleDecline, handleCancel } =
    useFriendRequest();

  const [activeTab, setActiveTab] = useState<RequestTab>("received");
  const [direction, setDirection] = useState<number>(1);

  const handleTabChange = (tab: RequestTab) => {
    if (tab === activeTab) return;
    setDirection(tab === "received" ? -1 : 1);
    setActiveTab(tab);
  };

  const receivedRequests = pendingRequests.filter(
    (req) => req.receiver.id === currentUserId
  );
  const sentRequests = pendingRequests.filter(
    (req) => req.sender.id === currentUserId
  );

  return (
    <SidebarLayout title="Friend Requests">
      {/* Tabs */}
      <div className="flex custom-border-b">
        <button
          className={`flex-1 py-3 font-medium ${
            activeTab === "received" ? "text-green-400" : "opacity-60"
          }`}
          onClick={() => handleTabChange("received")}
        >
          Requests {receivedRequests.length > 0 && receivedRequests.length}
        </button>
        <button
          className={`flex-1 py-3 font-medium ${
            activeTab === "sent" ? "text-green-400" : "opacity-60"
          }`}
          onClick={() => handleTabChange("sent")}
        >
          Sent {sentRequests.length > 0 && sentRequests.length}
        </button>
      </div>

      {/* Content */}
      <SlidingContainer uniqueKey={activeTab} direction={direction}>
        <div className="overflow-x-hidden overflow-y-auto flex-1">
          {activeTab === "received" ? (
            receivedRequests.length > 0 ? (
              receivedRequests.map((request) => {
                const firstName = request.sender.name.split(" ")[0];

                return (
                  <div
                    key={request.id}
                    className="flex p-3 gap-4 w-full custom-border-b cursor-pointer"
                    onClick={() => createOrGetDirectChat(request.sender.id)}
                  >
                    <Avatar
                      avatarUrl={request.sender.avatarUrl}
                      name={firstName}
                      size="12"
                      className="mt-1"
                    />

                    <div className="flex flex-col flex-1 gap-1">
                      <div className="flex justify-between items-center">
                        <h1 className="font-semibold">{request.sender.name}</h1>
                        <p className="text-xs opacity-60">
                          {formatTimeAgo(request.updatedAt)}
                        </p>
                      </div>
                      {request.mutualFriends > 0 && (
                        <p className="text-sm opacity-40">
                          {request.mutualFriends} mutual friend
                          {request.mutualFriends !== 1 ? "s" : ""}
                        </p>
                      )}

                      {request.requestMessage && (
                        <p className="text-sm opacity-60 italic">
                          {request.requestMessage}
                        </p>
                      )}

                      <div className="flex gap-2 mt-2">
                        <button
                          className="bg-[var(--primary-green)] px-3 py-1 rounded text-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAccept(request.id, request.sender.id);
                          }}
                        >
                          Accept
                        </button>
                        <button
                          className="custom-border hover:bg-red-500 px-3 py-1 rounded text-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDecline(request.id, request.sender.id);
                          }}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center mt-8 opacity-60">
                <i className="material-symbols-outlined text-6xl mb-4">
                  person_add
                </i>
                <p>No friend requests</p>
              </div>
            )
          ) : sentRequests.length > 0 ? (
            sentRequests.map((request) => {
              const firstName = request.receiver.name.split(" ")[0];

              return (
                <div
                  key={request.id}
                  className="flex p-3 gap-4 w-full custom-border-b cursor-pointer"
                >
                  <Avatar
                    avatarUrl={request.receiver.avatarUrl}
                    name={firstName}
                    size="12"
                    className="mt-1"
                  />

                  <div
                    className="flex flex-col flex-1 gap-1"
                    onClick={() => createOrGetDirectChat(request.receiver.id)}
                  >
                    <div className="flex justify-between items-center">
                      <h1 className="font-semibold">{request.receiver.name}</h1>
                      <p className="text-xs opacity-60">
                        {formatTimeAgo(request.updatedAt)}
                      </p>
                    </div>
                    <p className="text-sm opacity-40">
                      {request.mutualFriends} mutual friend
                      {request.mutualFriends !== 1 ? "s" : ""}
                    </p>

                    <div className="flex gap-2 mt-2">
                      <button
                        className="custom-border hover:bg-red-500 px-3 py-1 rounded text-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCancel(request.id, request.receiver.id);
                        }}
                      >
                        Cancel Request
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center mt-8 opacity-60">
              <i className="material-symbols-outlined text-6xl mb-4">send</i>
              <p>No sent requests</p>
            </div>
          )}
        </div>
      </SlidingContainer>
    </SidebarLayout>
  );
};

export default SidebarFriendRequests;
