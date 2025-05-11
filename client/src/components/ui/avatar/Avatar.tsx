import { MyProfileProps } from "@/data/types";

type AvatarProps = {
  user: MyProfileProps | unknown;
  textSize?: string;
  className?: string;
};

export const Avatar: React.FC<AvatarProps> = ({
  user,
  textSize = "text-xl",
  className = "",
}) => {
  if (!user) return null;

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full border-2 border-[var(--border-color)] ${className}`}
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
