import React, { useState } from "react";
import { userService } from "@/services/userService";
import ContactInfoItem from "./contactInfoItem";
import { useCurrentUser } from "@/stores/authStore";
import { AnimatePresence, motion } from "framer-motion";
import { useChatStore } from "@/stores/chatStore";
import { Avatar } from "./avatar/Avatar";
import { FriendshipStatus } from "@/types/enums/friendshipType";
import FriendshipBtn from "./FriendshipBtn";
import type { otherUser } from "@/types/responses/user.response";

const CreateNewChat: React.FC = () => {
  const currentUser = useCurrentUser();

  const createOrGetDirectChat = useChatStore((s) => s.createOrGetDirectChat);

  const [query, setQuery] = useState("");
  const [user, setUser] = useState<otherUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUser(null);
    setLoading(true);

    try {
      const foundUser = await userService.getUserByIdentifier(query.trim());
      console.log("foundedUser: ", foundUser);
      setUser(foundUser);
    } catch (err: unknown) {
      console.log("Search for user: ", String(err));
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

  return (
    <div className="flex flex-col gap-3 p-2 h-full relative overflow-hidden">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex w-full items-center gap-1 p-1 px-2 rounded border-2 border-[var(--border-color)] shadow focus-within:border-[var(--primary-color)] focus-within:shadow-md transition-all duration-200">
          <input
            type="text"
            name="userInput"
            placeholder="@username/email/phoneNumber"
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none"
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="bg-[var(--primary-green)] py-1 w-full flex gap-2 items-center justify-center text-white rounded"
          disabled={loading}
        >
          {loading ? "Searching..." : "Find User"}
          <span className="material-symbols-outlined">person_search</span>
        </button>
      </form>

      {error && <p className="text-red-400 text-center">{error}</p>}
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
            className="bg-[var(--card-bg-color)] custom-border rounded-lg flex flex-col justify-between h-full overflow-hidden"
          >
            <div className="flex-1 flex flex-col items-center justify-start gap-2 p-2 pt-4 overflow-y-auto">
              <Avatar
                avatarUrl={user.avatarUrl}
                name={user.firstName}
                className="w-[120px] h-[120px] cursor-pointer hover:border-4 transform transition-transform duration-300 hover:scale-110"
                onClick={() => createOrGetDirectChat(user.id)}
              />

              <h1 className="font-bold text-xl">
                {user.firstName} {user.lastName}
              </h1>
              {user.friendshipStatus === FriendshipStatus.ACCEPTED && (
                <h1 className="text-[var(--primary-green)] -mt-1">Friend</h1>
              )}
              <h1>{user.bio}</h1>

              <div className="w-full flex flex-col font-light my-2 custom-border-t custom-border-b">
                <ContactInfoItem
                  icon="alternate_email"
                  value={user.username}
                  copyType="username"
                  defaultText="No username"
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

            {user.id === currentUser?.id || (
              <div className="w-full border-t-2 border-[var(--border-color)]">
                {user.friendshipStatus !== FriendshipStatus.ACCEPTED ? (
                  <FriendshipBtn
                    userId={user.id}
                    username={user.username}
                    firstName={user.firstName}
                    lastName={user.lastName}
                    avatarUrl={user.avatarUrl}
                    friendshipStatus={user.friendshipStatus}
                    onStatusChange={updateFriendshipStatus}
                  />
                ) : (
                  <button
                    className="w-full py-1 flex gap-1 items-center justify-center hover:bg-[var(--primary-green)]"
                    onClick={() => createOrGetDirectChat(user.id)}
                  >
                    Start Chat
                    <span className="material-symbols-outlined">
                      arrow_right_alt
                    </span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateNewChat;
