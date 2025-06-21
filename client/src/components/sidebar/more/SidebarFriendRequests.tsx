import React, { useState } from "react";
import { Avatar } from "../../ui/avatar/Avatar";
import { getTimeAgo } from "../../../utils/getTimeAgo";
import { useFriendshipStore } from "@/stores/friendshipStore";
import { FriendshipStatus } from "@/types/friendship";
import { SlidingContainer } from "../../ui/SlidingContainer";
import { useChatStore } from "@/stores/chatStore";
import SidebarLayout from "@/pages/SidebarLayout";

type RequestTab = "received" | "sent";

const SidebarFriendRequests: React.FC = () => {
  const createOrGetDirectChat = useChatStore(
    (state) => state.createOrGetDirectChat
  );
  const getDirectChatByUserId = useChatStore(
    (state) => state.getDirectChatByUserId
  );
  const { receivedRequests, sentRequests, respondToRequest, cancelRequest } =
    useFriendshipStore();
  const [activeTab, setActiveTab] = useState<RequestTab>("received");
  const [direction, setDirection] = useState<number>(1);

  const handleTabChange = (tab: RequestTab) => {
    if (tab === activeTab) return;
    setDirection(tab === "received" ? -1 : 1);
    setActiveTab(tab);
  };

  const handleAcceptRequest = async (requestId: string, senderId: string) => {
    try {
      await respondToRequest(requestId, FriendshipStatus.ACCEPTED);
      getDirectChatByUserId(senderId);
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

  const handleDeclineRequest = async (requestId: string, senderId: string) => {
    try {
      await respondToRequest(requestId, FriendshipStatus.DECLINED);
      getDirectChatByUserId(senderId);
    } catch (error) {
      console.error("Failed to decline friend request:", error);
    }
  };

  const handleCancelRequest = async (requestId: string, receiverId: string) => {
    try {
      await cancelRequest(requestId);
      getDirectChatByUserId(receiverId);
    } catch (error) {
      console.error("Failed to cancel friend request:", error);
    }
  };

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

      {/* Content with sliding animation */}
      <SlidingContainer uniqueKey={activeTab} direction={direction}>
        <div className="overflow-x-hidden overflow-y-auto flex-1">
          {activeTab === "received" ? (
            receivedRequests.length > 0 ? (
              receivedRequests.map((request) => {
                const [firstName] = request.senderName.split(" ");

                return (
                  <div
                    key={request.id}
                    className="flex p-3 gap-4 w-full custom-border-b cursor-pointer"
                    onClick={() => createOrGetDirectChat(request.senderId)}
                  >
                    <Avatar
                      avatarUrl={request.senderAvatarUrl}
                      name={firstName}
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
                          className="bg-[var(--primary-green)] px-3 py-1 rounded text-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAcceptRequest(request.id, request.senderId);
                          }}
                        >
                          Accept
                        </button>
                        <button
                          className="custom-border hover:bg-red-500 px-3 py-1 rounded text-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeclineRequest(request.id, request.senderId);
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
              const [firstName] = request.receiverName.split(" ");

              return (
                <div
                  key={request.id}
                  className="flex p-3 gap-4 w-full custom-border-b cursor-pointer"
                >
                  <Avatar
                    avatarUrl={request.receiverAvatarUrl}
                    name={firstName}
                    size="12"
                    className="mt-1"
                  />

                  <div
                    className="flex flex-col flex-1 gap-1"
                    onClick={() => createOrGetDirectChat(request.receiverId)}
                  >
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
                        className="custom-border hover:bg-red-500 px-3 py-1 rounded text-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleCancelRequest(request.id, request.receiverId);
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
