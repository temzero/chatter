import { Avatar } from "./Avatar";
import { OnlineDot } from "../OnlineDot";
import type { ChatResponse } from "@/types/responses/chat.response";
import { ChatType } from "@/types/enums/ChatType";

type ChatAvatarProps = {
  chat?: ChatResponse | null;
  type?: "header" | "sidebar" | "info" | "contact";
  isBlocked?: boolean;
};

export const ChatAvatar: React.FC<ChatAvatarProps> = ({ chat, type, isBlocked = false }) => {
  const isOnline = false;

  const parentScaleClass =
    "transform transition-transform duration-300 hover:scale-110";
  const childrenScaleClass =
    "transition-transform duration-300 group-hover:scale-125";

  if (!chat) {
    return (
      <div
        className={`bg-[var(--border-color)] flex items-center justify-center overflow-hidden ${
          type === "header"
            ? "h-11 w-11 rounded-[10px]"
            : type === "info"
            ? "h-32 w-32 rounded-[30px]"
            : type === "contact"
            ? "h-12 w-12 rounded-[30px]"
            : "h-16 w-16 rounded-2xl"
        }`}
      >
        <i className="material-symbols-outlined text-2xl opacity-20">error</i>
      </div>
    );
  }

  const getStyles = (): {
    size: string;
    rounded: string;
    iconSize: string;
    fallbackIconSize: string;
    borderWidth: string;
    onlineDotClass: string;
  } => {
    switch (type) {
      case "header":
        return {
          size: "h-11 w-11",
          rounded: "rounded-[10px]",
          iconSize: "text-lg",
          fallbackIconSize: "text-4xl",
          borderWidth: "4px",
          onlineDotClass: "right-[1px] bottom-[1px]",
        };
      case "info":
        return {
          size: "h-32 w-32",
          rounded: "rounded-[30px]",
          iconSize: "text-6xl",
          fallbackIconSize: "text-8xl",
          borderWidth: "6px",
          onlineDotClass: "right-4 bottom-4",
        };
      case "contact":
        return {
          size: "h-12 w-12",
          rounded: "rounded-[30px]",
          iconSize: "text-6xl",
          fallbackIconSize: "text-8xl",
          borderWidth: "6px",
          onlineDotClass: "right-0 bottom-0",
        };
      case "sidebar":
      default:
        return {
          size: "h-16 w-16",
          rounded: "rounded-2xl",
          iconSize: "text-2xl",
          fallbackIconSize: "text-6xl",
          borderWidth: "4px",
          onlineDotClass: "right-[5px] bottom-[5px]",
        };
    }
  };

  const styles = getStyles();
  const sharedBase = `flex items-center justify-center ${parentScaleClass} ${styles.size}`;
  const showOnlineDot = type !== "info";
  const squircleShape = `[mask-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCB0cmFuc2Zvcm09InJvdGF0ZSg0NSA1MCA1MCkiIGQ9Ik01MCwwQzMwLDAsMCwzMCwwLDUwczMwLDUwLDUwLDUwczUwLTMwLDUwLTUwUzcwLDAsNTAsMHoiLz48L3N2Zz4=)] 
    [mask-size:100%_100%] [mask-repeat:no-repeat]`;

  switch (chat.type) {
    case ChatType.CHANNEL: {
      const channelChat = chat;
      return (
        <div
          className={`group overflow-hidden ${sharedBase} ${styles.rounded} bg-[var(--border-color)] ${parentScaleClass}`}
        >
          {channelChat.avatarUrl ? (
            <img
              src={channelChat.avatarUrl}
              alt={`${channelChat.name || "Channel"}'s avatar`}
              loading="lazy"
              className={`h-full w-full object-cover ${childrenScaleClass} ${squircleShape}`}
            />
          ) : (
            <i
              className={`material-symbols-outlined ${styles.fallbackIconSize} ${squircleShape} opacity-20 flex items-center justify-center`}
            >
              tv
            </i>
          )}
        </div>
      );
    }

    case ChatType.GROUP: {
      const groupChat = chat;
      return (
        <div
          className={`relative group overflow-hidden ${sharedBase} ${styles.rounded} ${parentScaleClass}`}
        >
          {groupChat.avatarUrl ? (
            <img
              className={`h-full w-full object-cover ${childrenScaleClass} ${styles.rounded}`}
              src={groupChat.avatarUrl}
              alt={`${groupChat.name || "Group"}'s avatar`}
              loading="lazy"
            />
          ) : (
            <div
              className={`bg-[var(--border-color)] cursor-pointer h-full w-full ${styles.rounded}`}
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
          )}
          {showOnlineDot && (
            <OnlineDot
              isOnline={isOnline}
              className={`absolute ${styles.onlineDotClass}`}
            />
          )}
        </div>
      );
    }

    case ChatType.DIRECT: {
      const directChat = chat;

      return (
        <div className={`relative group overflow-hidden ${parentScaleClass}`}>
          <Avatar
            avatarUrl={directChat.avatarUrl ?? undefined}
            name={directChat.name ?? undefined}
            className={`${styles.size} ${styles.rounded} object-cover`}
            isBlocked={isBlocked}
          />
          {showOnlineDot && (
            <OnlineDot
              isOnline={isOnline}
              className={`absolute ${styles.onlineDotClass}`}
            />
          )}
        </div>
      );
    }

    case ChatType.SAVED: {
      return (
        <span className="material-symbols-outlined text-4xl">bookmark</span>
      );
    }

    default:
      return (
        <div className={`bg-[var(--border-color)] ${sharedBase}`}>
          <i
            className={`material-symbols-outlined ${styles.fallbackIconSize} opacity-20 flex items-center justify-center`}
          >
            chat
          </i>
        </div>
      );
  }
};
