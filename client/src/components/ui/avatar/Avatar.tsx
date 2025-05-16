import type { ChatPartner, ChatGroupMember } from "@/types/chat";
import type { User } from "@/types/user";

type AvatarProps = {
  user: User | ChatPartner | ChatGroupMember | unknown;
  size?: string;
  textSize?: string;
  className?: string;
};

export const Avatar: React.FC<AvatarProps> = ({
  user,
  size = "10",
  textSize = "text-xl",
  className = "",
}) => {
  if (!user) return null;

  return (
    <div
      className={`w-${size} h-${size} flex items-center justify-center overflow-hidden rounded-full border-2 border-[var(--border-color)] ${className}`}
    >
      {user.avatar ? (
        <img
          className="h-full w-full object-cover"
          src={user.avatar}
          loading="lazy"
        />
      ) : (
        <h1
          className={`h-full w-full font-light flex items-center justify-center bg-[var(--border-color)] select-none ${textSize}`}
        >
          {user.first_name.charAt(0).toUpperCase()}
          {user.last_name.charAt(0).toUpperCase()}
        </h1>
      )}
    </div>
  );
};
