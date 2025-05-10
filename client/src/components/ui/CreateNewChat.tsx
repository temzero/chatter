import React, { useState } from "react";
import { userService } from "@/services/userService";
import { MyProfileProps } from "@/data/types";
import ContactInfoItem from "./contactInfoItem";

const CreateNewChat: React.FC = () => {
  const [query, setQuery] = useState("");
  const [requestMessage, setRequestMessage] = useState(
    "Hello! I'd like to connect and chat with you."
  );
  const [user, setUser] = useState<MyProfileProps | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [friendRequestLoading, setFriendRequestLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUser(null);
    setLoading(true);
    setFriendRequestSent(false);

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

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= 100) {
      setRequestMessage(e.target.value);
    }
  };

  const handleFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || friendRequestSent) return;

    setFriendRequestLoading(true);
    setError(null);

    try {
      await userService.sendFriendRequest({
        recipientId: user.id,
        message: requestMessage.trim()
      });
      setFriendRequestSent(true);
    } catch (err: unknown) {
      console.error("Failed to send friend request:", err);
      setError("Failed to send friend request");
    } finally {
      setFriendRequestLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-2 h-full relative">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex w-full items-center gap-1 p-1 px-2 rounded border-2 border-[var(--border-color)] shadow focus-within:border-[var(--primary-color)] focus-within:shadow-md transition-all duration-200">
          <input
            type="text"
            name="userInput"
            placeholder="@username/email/phone_number"
            autoFocus
            required
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent outline-none"
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
        <div className="border-2 border-[var(--border-color)] rounded-lg flex flex-col justify-between h-full overflow-hidden">
          {/* Scrollable user info */}
          <div className="flex-1 flex flex-col items-center justify-start gap-2 p-2 overflow-y-auto">
            <a className="h-24 w-24 min-w-24 mt-1 flex items-center justify-center rounded-full custom-border">
              {user.avatar ? (
                <img
                  className="w-full h-full rounded-full object-cover"
                  src={user.avatar}
                />
              ) : (
                <i className="material-symbols-outlined text-8xl opacity-20">
                  mood
                </i>
              )}
            </a>
            <h1 className="font-bold text-xl">
              {user.first_name} {user.last_name}
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
                value={user.phone_number}
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

          {/* Fixed friend request input at the bottom */}
          <form 
            className="w-full border-t-2 border-[var(--border-color)] pt-1 p-2 bg-[var(--sidebar-color)]"
            onSubmit={handleFriendRequest}
          >
            {friendRequestSent ? (
              <div className="text-center py-2 text-green-500">
                Friend request sent successfully!
              </div>
            ) : (
              <>
                <textarea
                  placeholder="Send request message..."
                  className="w-full max-h-20 p-1 px-2 border rounded resize-none"
                  value={requestMessage}
                  onChange={handleMessageChange}
                  maxLength={100}
                />
                <button 
                  className="bg-[var(--primary-green)] w-full py-1 flex gap-2 mt-1 rounded text-white justify-center"
                  disabled={friendRequestLoading}
                >
                  {friendRequestLoading ? "Sending..." : "Send Friend Request"}
                </button>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateNewChat;