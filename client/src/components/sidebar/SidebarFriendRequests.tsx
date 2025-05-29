import React, { useState } from "react";
import { useSidebarStore } from "@/stores/sidebarStore";
import { Avatar } from "../ui/avatar/Avatar";
import { getTimeAgo } from "../../utils/getTimeAgo";
import { useFriendRequestStore } from "@/stores/friendRequestStore";
import { FriendshipStatus } from "@/types/friendship";
import { SlidingContainer } from "../ui/SlidingContainer";

type RequestTab = "received" | "sent";

const SidebarFriendRequests: React.FC = () => {
  const { setSidebar } = useSidebarStore();
  const {
    receivedRequests,
    sentRequests,
    respondToRequest,
    removeReceivedRequest,
    // removeSentRequest,
    cancelRequest,
  } = useFriendRequestStore();
  const [activeTab, setActiveTab] = useState<RequestTab>("received");
  const [direction, setDirection] = useState<number>(1);

  const handleTabChange = (tab: RequestTab) => {
    if (tab === activeTab) return;
    setDirection(tab === "received" ? -1 : 1);
    setActiveTab(tab);
  };

  const handleRespondToRequest = async (
    friendshipId: string,
    status: FriendshipStatus
  ) => {
    try {
      await respondToRequest(friendshipId, status);
      removeReceivedRequest(friendshipId);
    } catch (error) {
      console.error("Failed to respond to friend request:", error);
    }
  };

  const handleCancelRequest = async (friendshipId: string) => {
    try {
      await cancelRequest(friendshipId);
      // Remove the request from the local state if successful
      // (assuming your store handles this)
    } catch (error) {
      console.error("Failed to cancel friend request:", error);
    }
  };

  return (
    <aside
      className={`w-[var(--sidebar-width)] h-full flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Header */}
      <header className="flex w-full justify-between items-center min-h-[var(--header-height)] custom-border-b">
        <i
          className="material-symbols-outlined nav-btn"
          onClick={() => setSidebar("more")}
        >
          arrow_back
        </i>

        <h1 className="font-semibold text-lg">Friend Requests</h1>

        <i
          className="material-symbols-outlined nav-btn ml-auto"
          onClick={() => setSidebar("default")}
        >
          close
        </i>
      </header>

      {/* Tabs */}
      <div className="flex custom-border-b">
        <button
          className={`flex-1 py-3 font-medium ${
            activeTab === "received"
              ? "text-green-400"
              : "opacity-60"
          }`}
          onClick={() => handleTabChange("received")}
        >
          Requests ({receivedRequests.length})
        </button>
        <button
          className={`flex-1 py-3 font-medium ${
            activeTab === "sent"
              ? "text-green-400"
              : "opacity-60"
          }`}
          onClick={() => handleTabChange("sent")}
        >
          Sent ({sentRequests.length})
        </button>
      </div>

      {/* Content with sliding animation */}
      <SlidingContainer uniqueKey={activeTab} direction={direction}>
        <div className="overflow-x-hidden overflow-y-auto flex-1">
          {activeTab === "received" ? (
            receivedRequests.length > 0 ? (
              receivedRequests.map((request) => {
                const [firstName, lastName] = request.senderName.split(" ");

                return (
                  <div
                    key={request.id}
                    className="flex p-3 gap-4 w-full custom-border-b cursor-pointer"
                  >
                    <Avatar
                      avatarUrl={request.senderAvatarUrl}
                      firstName={firstName}
                      lastName={lastName || ""}
                      size="12"
                      className="mt-1"
                    />

                    <div className="flex flex-col flex-1 gap-1">
                      <div className="flex justify-between items-center">
                        <h1 className="font-semibold">{request.senderName}</h1>
                        <p className="text-xs opacity-60">
                          {getTimeAgo(request.updatedAt)}
                        </p>
                      </div>
                      <p className="text-sm opacity-40">
                        {request.mutualFriends} mutual friend
                        {request.mutualFriends !== 1 ? "s" : ""}
                      </p>

                      {request.requestMessage && (
                        <p className="text-sm opacity-60 italic">
                          {request.requestMessage}
                        </p>
                      )}

                      <div className="flex gap-2 mt-2">
                        <button
                          className="bg-[var(--primary-green)] text-white px-3 py-1 rounded text-sm"
                          onClick={() =>
                            handleRespondToRequest(
                              request.id,
                              FriendshipStatus.ACCEPTED
                            )
                          }
                        >
                          Accept
                        </button>
                        <button
                          className="custom-border hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
                          onClick={() =>
                            handleRespondToRequest(
                              request.id,
                              FriendshipStatus.DECLINED
                            )
                          }
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
              const [firstName, lastName] = request.receiverName.split(" ");

              return (
                <div
                  key={request.id}
                  className="flex p-3 gap-4 w-full custom-border-b cursor-pointer"
                >
                  <Avatar
                    avatarUrl={request.receiverAvatarUrl}
                    firstName={firstName}
                    lastName={lastName || ""}
                    size="12"
                    className="mt-1"
                  />

                  <div className="flex flex-col flex-1 gap-1">
                    <div className="flex justify-between items-center">
                      <h1 className="font-semibold">{request.receiverName}</h1>
                      <p className="text-xs opacity-60">
                        {getTimeAgo(request.updatedAt)}
                      </p>
                    </div>
                    <p className="text-sm opacity-40">
                      {request.mutualFriends} mutual friend
                      {request.mutualFriends !== 1 ? "s" : ""}
                    </p>

                    <div className="flex gap-2 mt-2">
                      <button
                        className="custom-border hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
                        onClick={() => handleCancelRequest(request.id)}
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
    </aside>
  );
};

export default SidebarFriendRequests;
