import React, { useState } from "react";
import { userService } from "@/services/userService";
import { MyProfileProps } from "@/data/types";
import ContactInfoItem from "./contactInfoItem";
import { useAuthStore } from "@/stores/authStore";
import { motion } from "framer-motion";
import { useModalStore } from "@/stores/modalStore";
import { useChatStore } from "@/stores/chatStore";
import { Avatar } from "./avatar/Avatar";

const CreateNewChat: React.FC = () => {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setActiveChat = useChatStore((s) => s.setActiveChat);
  const createPrivateChat = useChatStore((s) => s.createPrivateChat);
  const { openModal } = useModalStore();

  const [query, setQuery] = useState("");
  const [user, setUser] = useState<MyProfileProps | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUser(null);
    setLoading(true);

    try {
      const foundUser = await userService.getUserByIdentifier(query.trim());
      setUser(foundUser);
    } catch (err: unknown) {
      console.log("Search for user: ", String(err));
      setError("User not found!");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenFriendRequest() {
    if (!user) return;

    openModal("friend-request", {
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
    });
  }

  async function handleStartChat() {
    if (!user) return;

    try {
      setLoading(true);
      const newChat = await createPrivateChat(user.id);
      console.log("newChat: ", newChat);
      // Set the new chat as active
      setActiveChat(newChat);
    } catch (err) {
      console.error("Failed to start chat:", err);
      setError("Failed to start chat. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
          {/* Scrollable user info */}
          <div className="flex-1 flex flex-col items-center justify-start gap-2 p-2 pt-4 overflow-y-auto">
            <Avatar user={user} size="28" />

            <h1 className="font-bold text-xl">
              {user.firstName} {user.lastName}
            </h1>
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
            <div className="w-full flex border-t-2 border-[var(--border-color)]">
              <button
                className="w-full py-1 flex gap-1 custom-border-r justify-center hover:bg-[var(--primary-green)] rounded-none"
                onClick={handleOpenFriendRequest}
              >
                <span className="material-symbols-outlined">person_add</span>
              </button>
              <button
                className="w-full py-1 flex justify-center hover:bg-[var(--primary-green)] rounded-none"
                onClick={(e) => {
                  e.preventDefault();
                  handleStartChat();
                }}
              >
                <span className="material-symbols-outlined">chat_bubble</span>
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default CreateNewChat;
