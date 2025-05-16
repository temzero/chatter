import { Avatar } from "./Avatar";
import type { Chat } from "@/types/chat";

type ChatAvatarProps = {
  chat: Chat;
  type?: "header" | "sidebar" | "info" | "contact";
};

export const ChatAvatar: React.FC<ChatAvatarProps> = ({
  chat,
  type = "sidebar",
}) => {
  if (!chat) {
    return null;
  }

  // Define size and rounded styles based on type
  const getStyles = () => {
    switch (type) {
      case "header":
        return {
          size: "h-11 w-11", // Added min-h
          rounded: "rounded-[10px]",
          iconSize: "text-lg",
          fallbackIconSize: "text-4xl",
          border: "border-[4px]",
        };
      case "info":
        return {
          size: "h-32 w-32", // Added min-h
          rounded: "rounded-[30px]",
          iconSize: "text-6xl",
          fallbackIconSize: "text-8xl",
          border: "border-[6px]",
        };
      case "contact":
        return {
          size: "h-12 w-12", // Added min-h
          rounded: "rounded-[30px]",
          iconSize: "text-6xl",
          fallbackIconSize: "text-8xl",
          border: "border-[6px]",
        };
      case "sidebar":
      default:
        return {
          size: "h-16 w-16", // Added min-h
          rounded: "rounded-2xl",
          iconSize: "text-2xl",
          fallbackIconSize: "text-6xl",
          border: "border-[4px]",
        };
    }
  };

  const styles = getStyles();
  const sharedBase = `flex items-center justify-center overflow-hidden ${styles.size} ${styles.rounded}`;

  switch (chat.type) {
    case "channel":
      return (
        <div
          className={`${styles.border} border-[var(--border-color)] ${sharedBase}`}
        >
          {chat.avatar ? (
            <img
              className="h-full w-full object-cover"
              src={chat.avatar}
              alt={`${chat.name}'s avatar`}
              loading="lazy"
            />
          ) : (
            <i
              className={`material-symbols-outlined ${styles.fallbackIconSize} opacity-20 flex items-center justify-center`}
            >
              tv
            </i>
          )}
        </div>
      );

    case "group":
      return (
        <div
          className={`bg-[var(--border-color)] cursor-pointer ${sharedBase}`}
        >
          <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex items-center justify-center">
                <i
                  className={`material-symbols-outlined border ${styles.iconSize} opacity-20 flex items-center justify-center rounded-full h-full w-full`}
                >
                  mood
                </i>
              </div>
            ))}
          </div>
        </div>
      );

    default: // private
      return (
        <Avatar user={chat.chatPartner} className={`${styles.size}`} />
      );
  }
};
