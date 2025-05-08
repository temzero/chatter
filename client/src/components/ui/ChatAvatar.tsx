
import type { Chat } from "@/types/chat";

type ChatAvatarProps = {
  chat: Chat;
  type?: "header" | "sidebar" | "info";
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
          dimension: "h-11 w-11 min-w-[2.75rem] min-h-[2.75rem]", // Added min-h
          rounded: "rounded-[10px]",
          iconSize: "text-lg",
          fallbackIconSize: "text-4xl",
          border: "border-[4px]",
        };
      case "info":
        return {
          dimension: "h-32 w-32 min-w-[8rem] min-h-[8rem]", // Added min-h
          rounded: "rounded-[30px]",
          iconSize: "text-6xl",
          fallbackIconSize: "text-8xl",
          border: "border-[6px]",
        };
      case "sidebar":
      default:
        return {
          dimension: "h-16 w-16 min-w-[4rem] min-h-[4rem]", // Added min-h
          rounded: "rounded-2xl",
          iconSize: "text-2xl",
          fallbackIconSize: "text-6xl",
          border: "border-[4px]",
        };
    }
  };

  const styles = getStyles();
  const sharedBase = `flex items-center justify-center overflow-hidden ${styles.dimension} ${styles.rounded}`;

  const renderAvatarContent = (fallbackIcon: string) =>
    chat.avatar ? (
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
        {fallbackIcon}
      </i>
    );

  if (chat.type === "channel") {
    return (
      <div
        className={`${styles.border} border-[var(--border-color)] ${sharedBase}`}
      >
        {renderAvatarContent("tv")}
      </div>
    );
  }

  if (chat.type === "group") {
    return (
      <div className={`bg-[var(--border-color)] cursor-pointer ${sharedBase}`}>
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
  }

  // Default case (private)
  return (
    <div className={`custom-border rounded-full ${sharedBase}`}>
      {renderAvatarContent("mood")}
    </div>
  );
};
