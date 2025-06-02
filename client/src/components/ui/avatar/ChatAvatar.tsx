import { Avatar } from "./Avatar";
import type {
  ChatResponse,
  DirectChatResponse,
  GroupChatResponse,
} from "@/types/chat";
import { ChatType } from "@/types/enums/ChatType";

type ChatAvatarProps = {
  chat?: ChatResponse | null; // Make chat optional
  type?: "header" | "sidebar" | "info" | "contact";
};

export const ChatAvatar: React.FC<ChatAvatarProps> = ({
  chat,
  type = "sidebar",
}) => {
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
  const getStyles = () => {
    switch (type) {
      case "header":
        return {
          size: "h-11 w-11",
          rounded: "rounded-[10px]",
          iconSize: "text-lg",
          fallbackIconSize: "text-4xl",
          borderWidth: "4px",
        };
      case "info":
        return {
          size: "h-32 w-32",
          rounded: "rounded-[30px]",
          iconSize: "text-6xl",
          fallbackIconSize: "text-8xl",
          borderWidth: "6px",
        };
      case "contact":
        return {
          size: "h-12 w-12",
          rounded: "rounded-[30px]",
          iconSize: "text-6xl",
          fallbackIconSize: "text-8xl",
          borderWidth: "6px",
        };
      case "sidebar":
      default:
        return {
          size: "h-16 w-16",
          rounded: "rounded-2xl",
          iconSize: "text-2xl",
          fallbackIconSize: "text-6xl",
          borderWidth: "4px",
        };
    }
  };

  const styles = getStyles();
  const sharedBase = `flex items-center justify-center overflow-hidden custom-border ${styles.size} ${styles.rounded}`;

  switch (chat.type) {
    case ChatType.CHANNEL: {
      const channelChat = chat as GroupChatResponse;
      return (
        <div className={`${sharedBase} relative`}>
          {channelChat.avatarUrl ? (
            <>
              <img
                className="h-full w-full object-cover"
                src={channelChat.avatarUrl}
                alt={`${channelChat.name || "Channel"}'s avatar`}
                loading="lazy"
              />
              <div
                className={`absolute inset-0 ${styles.rounded} border-[var(--border-color)] pointer-events-none`}
                style={{
                  borderWidth: styles.borderWidth,
                  borderStyle: "solid",
                  boxShadow: "inset 0 0 12px rgba(0, 0, 0, .8)",
                  filter: "blur(4px)",
                }}
              />
              <div
                className={`absolute inset-0 ${styles.rounded} pointer-events-none`}
                style={{
                  borderWidth: styles.borderWidth,
                  borderStyle: "solid",
                  borderColor: "var(--border-color)",
                }}
              />
            </>
          ) : (
            <i
              className={`material-symbols-outlined ${styles.fallbackIconSize} opacity-20 flex items-center justify-center`}
            >
              tv
            </i>
          )}
        </div>
      );
    }

    case ChatType.GROUP: {
      const groupChat = chat as GroupChatResponse;
      return (
        <div className={`${sharedBase}`}>
          {groupChat.avatarUrl ? (
            <img
              className="h-full w-full object-cover"
              src={groupChat.avatarUrl}
              alt={`${groupChat.name || "Group"}'s avatar`}
              loading="lazy"
            />
          ) : (
            <div className="bg-[var(--border-color)] cursor-pointer h-full w-full">
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
        </div>
      );
    }

    case ChatType.DIRECT: {
      const directChat = chat as DirectChatResponse;
      // Safe access to chatPartner properties
      const chatPartner = directChat.chatPartner || {};

      return (
        <Avatar
          avatarUrl={chatPartner.avatarUrl ?? undefined}
          firstName={chatPartner.firstName}
          lastName={chatPartner.lastName}
          className={`${styles.size}`}
        />
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
