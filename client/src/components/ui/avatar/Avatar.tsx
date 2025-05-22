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
  if (!user || typeof user !== "object") return null;

  const typedUser = user as User | ChatPartner | ChatGroupMember;

  const avatar = typedUser.avatar;
  const firstNameInitial = typedUser.firstName?.charAt(0)?.toUpperCase();
  const lastNameInitial = typedUser.lastName?.charAt(0)?.toUpperCase();

  const showInitials = firstNameInitial || lastNameInitial;

  return (
    <div
      className={`w-${size} h-${size} flex items-center justify-center overflow-hidden rounded-full border-2 border-[var(--border-color)] ${className}`}
    >
      {avatar ? (
        <img
          className="h-full w-full object-cover"
          src={avatar}
          loading="lazy"
          alt="User avatar"
        />
      ) : showInitials ? (
        <h1
          className={`h-full w-full font-light flex items-center justify-center bg-[var(--border-color)] select-none ${textSize}`}
        >
          {firstNameInitial}
          {lastNameInitial}
        </h1>
      ) : (
        <div className="h-full w-full bg-[var(--border-color)]"></div>
      )}
    </div>
  );
};
