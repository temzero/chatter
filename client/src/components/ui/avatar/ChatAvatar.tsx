import { Avatar } from "./Avatar";
import { OnlineDot } from "../OnlineDot";
import type {
  ChatResponse,
  DirectChatResponse,
  GroupChatResponse,
} from "@/types/chat";
import { ChatType } from "@/types/enums/ChatType";
import { useChatOnlineStatus } from "@/hooks/useChatOnlineStatus";

type ChatAvatarProps = {
  chat?: ChatResponse | null; // Make chat optional
  type?: "header" | "sidebar" | "info" | "contact";
};

export const ChatAvatar: React.FC<ChatAvatarProps> = ({
  chat,
  type = "sidebar",
}) => {
  const isOnline = useChatOnlineStatus(chat?.id);
  // Early return if no chat
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

  // Define size and rounded styles based on type
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
  const sharedBase = `flex items-center justify-center ${styles.size}`;
  const showOnlineDot = type !== "info";

  switch (chat.type) {
    case ChatType.CHANNEL: {
      const channelChat = chat as GroupChatResponse;
      return (
        <div
          className={`${sharedBase} overflow-hidden ${styles.rounded}`}
          style={{
            borderWidth: styles.borderWidth,
            borderStyle: "solid",
            borderColor: "grey",
          }}
        >
          {channelChat.avatarUrl ? (
            <>
              <img
                src={channelChat.avatarUrl}
                alt={`${channelChat.name || "Channel"}'s avatar`}
                loading="lazy"
              />
            </>
          ) : (
            <i className={`material-symbols-outlined ${styles.fallbackIconSize} opacity-20 flex items-center justify-center`}>
              tv
            </i>
          )}
        </div>
      );
    }

    case ChatType.GROUP: {
      const groupChat = chat as GroupChatResponse;
      return (
        <div className={`relative ${sharedBase}`}>
          {groupChat.avatarUrl ? (
            <img
              className={`h-full w-full object-cover custom-border ${styles.rounded}`}
              src={groupChat.avatarUrl}
              alt={`${groupChat.name || "Group"}'s avatar`}
              loading="lazy"
            />
          ) : (
            <div
              className={`bg-[var(--border-color)] cursor-pointer h-full w-full custom-border ${styles.rounded}`}
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
              className={`absolute bottom-0 right-0`}
            />
          )}
        </div>
      );
    }

    case ChatType.DIRECT: {
      const directChat = chat as DirectChatResponse;
      // Safe access to chatPartner properties
      const chatPartner = directChat.chatPartner || {};

      return (
        <div className="relative">
          <Avatar
            avatarUrl={chatPartner.avatarUrl ?? undefined}
            firstName={chatPartner.firstName}
            lastName={chatPartner.lastName}
            className={`${styles.size}`}
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
