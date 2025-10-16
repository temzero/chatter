import { OnlineDot } from "@/components/ui/OnlineDot";
import type { ChatResponse } from "@/shared/types/responses/chat.response";

type ChannelAvatarProps = {
  chat: ChatResponse;
  type?: "header" | "sidebar" | "info" | "contact" | "call";
  styles: {
    size: string;
    rounded: string;
    iconSize: string;
    fallbackIconSize: string;
    borderWidth: string;
    onlineDotClass: string;
    textSize: string;
  };
  parentScaleClass: string;
  childrenScaleClass: string;
  showOnlineDot: boolean;
  isOnline?: boolean;
};

export const ChannelAvatar: React.FC<ChannelAvatarProps> = ({
  chat,
  styles,
  parentScaleClass,
  childrenScaleClass,
  showOnlineDot,
  isOnline = false,
}) => {
  const squircleShape = `[mask-image:url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCB0cmFuc2Zvcm09InJvdGF0ZSg0NSA1MCA1MCkiIGQ9Ik01MCwwQzMwLDAsMCwzMCwwLDUwczMwLDUwLDUwLDUwczUwLTMwLDUwLTUwUzcwLDAsNTAsMHoiLz48L3N2Zz4=)] 
    [mask-size:100%_100%] [mask-repeat:no-repeat]`;

  return (
    <div
      className={`group overflow-hidden bg-[var(--border-color)] flex items-center justify-center ${parentScaleClass} ${styles.size} ${styles.rounded}`}
    >
      {chat.avatarUrl ? (
        <img
          src={chat.avatarUrl}
          alt={`${chat.name || "Channel"}'s avatar`}
          className={`h-full w-full object-cover ${childrenScaleClass} ${squircleShape}`}
        />
      ) : (
        <i
          className={`material-symbols-outlined ${styles.fallbackIconSize} ${squircleShape} opacity-20`}
        >
          tv
        </i>
      )}
      {showOnlineDot && (
        <OnlineDot
          isOnline={isOnline}
          className={`absolute ${styles.onlineDotClass}`}
        />
      )}
    </div>
  );
};
