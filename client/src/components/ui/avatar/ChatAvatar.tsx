import { Avatar } from "./Avatar";
import { OnlineDot } from "@/components/ui/OnlineDot";
import { ChatType } from "@/shared/types/enums/chat-type.enum";
import { GroupAvatar } from "./AvatarGroup";
import { ChannelAvatar } from "./AvatarChannel";
import { ChatResponse } from "@/shared/types/responses/chat.response";

type ChatAvatarProps = {
  chat?: ChatResponse | null;
  type?: "header" | "sidebar" | "info" | "contact" | "call";
  isBlocked?: boolean;
};

export const ChatAvatar: React.FC<ChatAvatarProps> = ({
  chat,
  type,
  isBlocked = false,
}) => {
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
            : type === "call"
            ? "h-14 w-14 rounded-[16px]"
            : "h-16 w-16 rounded-xl"
        }`}
      >
        <i className="material-symbols-outlined text-2xl opacity-20">error</i>
      </div>
    );
  }

  const getStyles = () => {
    switch (type) {
      case "header":
        return {
          size: "h-11 w-11",
          rounded: "rounded-[10px]",
          iconSize: "text-lg",
          fallbackIconSize: "text-4xl",
          borderWidth: "4px",
          onlineDotClass: "right-[1px] bottom-[1px]",
          textSize: "text-lg",
        };
      case "info":
        return {
          size: "h-32 w-32",
          rounded: "rounded-[30px]",
          iconSize: "text-6xl",
          fallbackIconSize: "text-8xl",
          borderWidth: "6px",
          onlineDotClass: "right-4 bottom-4",
          textSize: "text-6xl",
        };
      case "contact":
        return {
          size: "h-12 w-12",
          rounded: "rounded-[30px]",
          iconSize: "text-6xl",
          fallbackIconSize: "text-8xl",
          borderWidth: "6px",
          onlineDotClass: "right-0 bottom-0",
          textSize: "text-xl",
        };
      case "call":
        return {
          size: "h-32 w-32",
          rounded: "rounded-[28px]",
          iconSize: "text-6xl",
          fallbackIconSize: "text-8xl",
          borderWidth: "6px",
          onlineDotClass: "right-0 bottom-0",
          textSize: "text-xl",
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
          textSize: "text-4xl",
        };
    }
  };

  const styles = getStyles();
  const showOnlineDot = type !== "info";

  switch (chat.type) {
    case ChatType.CHANNEL:
      return (
        <ChannelAvatar
          chat={chat}
          type={type}
          styles={styles}
          parentScaleClass={parentScaleClass}
          childrenScaleClass={childrenScaleClass}
          showOnlineDot={showOnlineDot}
          isOnline={isOnline}
        />
      );

    case ChatType.GROUP:
      return (
        <GroupAvatar
          chat={chat}
          type={type}
          styles={styles}
          parentScaleClass={parentScaleClass}
          childrenScaleClass={childrenScaleClass}
          showOnlineDot={showOnlineDot}
          isOnline={isOnline}
        />
      );

    case ChatType.DIRECT:
      return (
        <div className={`relative group overflow-hidden ${parentScaleClass}`}>
          <Avatar
            avatarUrl={chat.avatarUrl ?? undefined}
            name={chat.name ?? undefined}
            textSize={styles.textSize}
            className={`${styles.size} object-cover`}
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

    case ChatType.SAVED:
      return (
        <span className="material-symbols-outlined text-4xl">bookmark</span>
      );

    default:
      return (
        <div
          className={`bg-[var(--border-color)] select-none ${parentScaleClass} ${styles.size} flex flex-1 items-center justify-center`}
        >
          <i
            className={`material-symbols-outlined ${styles.fallbackIconSize} opacity-20`}
          >
            chat
          </i>
        </div>
      );
  }
};
