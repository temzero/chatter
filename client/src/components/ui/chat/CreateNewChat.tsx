import React, { useState } from "react";
import { userService } from "@/services/http/userService";
import { getCurrentUserId } from "@/stores/authStore";
import { AnimatePresence, motion } from "framer-motion";
import { useChatStore } from "@/stores/chatStore";
import { Avatar } from "@/components/ui/avatar/Avatar";
import { FriendshipStatus } from "@/shared/types/enums/friendship-type.enum";
import { useUserStatus } from "@/stores/presenceStore";
import { useTranslation } from "react-i18next";
import { UserResponse } from "@/shared/types/responses/user.response";
import { getOpenModal, ModalType } from "@/stores/modalStore";
import FriendshipBtn from "@/components/ui/buttons/FriendshipBtn";
import ContactInfoItem from "@/components/ui/contact/contactInfoItem";
import SearchBar from "../SearchBar";

const CreateNewChat: React.FC = () => {
  const { t } = useTranslation();
  const currentUserId = getCurrentUserId();
  const openModal = getOpenModal();
  const createOrGetDirectChat = useChatStore.getState().createOrGetDirectChat;

  const [query, setQuery] = useState("");
  const [user, setUser] = useState<UserResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isMe = user?.id === currentUserId;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUser(null);
    setLoading(true);

    try {
      const foundUser = await userService.fetchUserByIdentifier(query.trim());
      setUser(foundUser);
    } catch (err: unknown) {
      console.error("Search for user: ", String(err));
      setError("User not found!");
    } finally {
      setLoading(false);
    }
  }

  const updateFriendshipStatus = (newStatus: FriendshipStatus | null) => {
    if (!user) return;
    setUser({
      ...user,
      friendshipStatus: newStatus,
    });
  };

  const isUserOnline = useUserStatus(user?.id);

  return (
    <div className="flex flex-col justify-between w-full h-full relative overflow-hidden">
      <div className="w-full h-full p-2">
        <AnimatePresence mode="wait">
          {user && (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 12,
                mass: 0.6,
              }}
              className="bg-(--card-bg-color) custom-border rounded-lg flex flex-col justify-between h-full overflow-hidden p-2"
            >
              {user.isBlockedMe ? (
                <div className="flex-1 flex flex-col gap-2 items-center justify-center text-center text-red-500 p-6">
                  <i className="material-symbols-outlined text-8xl! rotate-90 opacity-60 select-none">
                    block
                  </i>
                  <p>{t("sidebar_new_chat.direct.blocked_by_user_message")}</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 flex flex-col items-center justify-start gap-2 p-2 pt-4 overflow-y-auto">
                    <div
                      className={`border rounded-full! hover:shadow-xl hover:scale-110 transition-all ${
                        isUserOnline ? "border-2 border-(--primary-green)" : ""
                      }`}
                    >
                      <Avatar
                        avatarUrl={user.avatarUrl ?? undefined}
                        name={user.firstName}
                        className={`w-[120px] h-[120px] cursor-pointer`}
                        onClick={() =>
                          !user.isBlockedByMe && createOrGetDirectChat(user.id)
                        }
                        isBlocked={user.isBlockedByMe}
                      />
                    </div>

                    <div className="flex flex-col items-center">
                      <h1 className="font-bold text-xl">
                        {user.firstName} {user.lastName}
                      </h1>
                      {isMe && <h1 className="text-(--primary-green)">Me</h1>}
                    </div>

                    {user.friendshipStatus === FriendshipStatus.ACCEPTED && (
                      <h1
                        className={`-mt-1 ${
                          user.isBlockedByMe
                            ? "text-red-500"
                            : "text-(--primary-green)"
                        }`}
                      >
                        {user.isBlockedByMe
                          ? t("sidebar_new_chat.direct.friend_but_blocked")
                          : t("sidebar_new_chat.direct.friend")}
                      </h1>
                    )}

                    <h1>{user.bio}</h1>

                    <div className="w-full flex flex-col font-light my-2 custom-border-t custom-border-b">
                      <ContactInfoItem
                        icon="alternate_email"
                        value={user.username}
                        copyType="username"
                        defaultText={t("sidebar_new_chat.direct.no_username")}
                      />
                      <ContactInfoItem
                        icon="call"
                        value={user.phoneNumber}
                        copyType="phone"
                      />
                      <ContactInfoItem
                        icon="mail"
                        value={user.email}
                        copyType="email"
                      />
                      <ContactInfoItem
                        icon="cake"
                        value={user.birthday}
                        copyType="birthday"
                      />
                    </div>
                  </div>

                  {!isMe && (
                    <div className="w-full border-t-2 border-(--border-color)">
                      {/* Unblock button takes priority when user is blocked */}
                      {user.isBlockedByMe ? (
                        <button
                          className="w-full py-1 flex gap-1 items-center justify-center hover:bg-(--primary-green) bg-red-500 text-white"
                          // onClick={() => handleUnblock(user.id, user.firstName)}
                          onClick={() =>
                            openModal(ModalType.UNBLOCK_USER, {
                              blockedUser: user,
                            })
                          }
                        >
                          <span className="material-symbols-outlined">
                            replay
                          </span>
                          {t("common.actions.unblock")}
                        </button>
                      ) : (
                        <>
                          {user.friendshipStatus !==
                          FriendshipStatus.ACCEPTED ? (
                            <FriendshipBtn
                              userId={user.id}
                              username={user.username}
                              firstName={user.firstName}
                              lastName={user.lastName}
                              avatarUrl={user.avatarUrl ?? undefined}
                              friendshipStatus={user.friendshipStatus}
                              onStatusChange={updateFriendshipStatus}
                            />
                          ) : (
                            <button
                              className="w-full py-1 flex gap-1 items-center justify-center hover:bg-(--primary-green)"
                              onClick={() => createOrGetDirectChat(user.id)}
                            >
                              {t("sidebar_new_chat.direct.start_chat")}
                              <span className="material-symbols-outlined">
                                arrow_right_alt
                              </span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col p-3 gap-2 border-2 border-b-0 border-(--border-color) bg-(--card-bg-color) rounded-t-xl"
      >
        {error && (
          <p className="text-red-400 text-center mb-2">
            {t("sidebar_new_chat.direct.user_not_found")}
          </p>
        )}

        <SearchBar
          placeholder={t("sidebar_new_chat.direct.placeholder")}
          autoFocus
          onSearch={(value) => setQuery(value)}
        />
        <button
          type="submit"
          className="bg-(--primary-green) py-1 w-full flex gap-2 items-center justify-center text-white rounded"
          disabled={loading || !query}
        >
          {loading
            ? t("common.loading.searching")
            : t("sidebar_new_chat.direct.find_user")}
          <span className="material-symbols-outlined">person_search</span>
        </button>
      </form>
    </div>
  );
};

export default CreateNewChat;
