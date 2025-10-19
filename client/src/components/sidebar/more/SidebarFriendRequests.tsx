// src/components/SidebarFriendRequests.tsx
import React, { useState } from "react";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { formatTimeAgo } from "@/common/utils/format/formatTimeAgo";
import { SlidingContainer } from "@/components/ui/layout/SlidingContainer";
import SidebarLayout from "@/layouts/SidebarLayout";
import { useCurrentUserId } from "@/stores/authStore";
import { useFriendRequest } from "@/common/hooks/useFriendRequest";
import { useChatStore } from "@/stores/chatStore";
import { useTranslation } from "react-i18next";

type RequestTab = "received" | "sent";

const SidebarFriendRequests: React.FC = () => {
  const { t } = useTranslation();
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
    <SidebarLayout title={t("sidebar_friend_requests.title")}>
      {/* Tabs */}
      <div className="flex custom-border-b">
        <button
          className={`flex-1 py-3 font-medium ${
            activeTab === "received" ? "text-green-400" : "opacity-60"
          }`}
          onClick={() => handleTabChange("received")}
        >
          {t("common.actions.requests")}{" "}
          {receivedRequests.length > 0 && receivedRequests.length}
        </button>
        <button
          className={`flex-1 py-3 font-medium ${
            activeTab === "sent" ? "text-green-400" : "opacity-60"
          }`}
          onClick={() => handleTabChange("sent")}
        >
          {t("common.actions.sent")}{" "}
          {sentRequests.length > 0 && sentRequests.length}
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
                          {t(
                            "sidebar_friend_requests.messages.mutual_friends_one",
                            {
                              count: request.mutualFriends,
                            }
                          )}
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
                          {t("common.actions.accept")}
                        </button>
                        <button
                          className="custom-border hover:bg-red-500 px-3 py-1 rounded text-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDecline(request.id, request.sender.id);
                          }}
                        >
                          {t("common.actions.decline")}
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
                <p>
                  {t("sidebar_friend_requests.messages.no_friend_requests")}
                </p>
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
                      {t(
                        "sidebar_friend_requests.messages.mutual_friends_one",
                        {
                          count: request.mutualFriends,
                        }
                      )}
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
                        {t("common.action.cancel_request")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center mt-8 opacity-60">
              <i className="material-symbols-outlined text-6xl mb-4">send</i>
              <p>{t("sidebar_friend_requests.messages.no_sent_requests")}</p>
            </div>
          )}
        </div>
      </SlidingContainer>
    </SidebarLayout>
  );
};

export default SidebarFriendRequests;
