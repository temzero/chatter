type AvatarProps = {
  avatarUrl?: string | undefined | null;
  firstName?: string;
  lastName?: string;
  size?: string;
  textSize?: string;
  className?: string;
};

export const Avatar: React.FC<AvatarProps> = ({
  avatarUrl,
  firstName,
  lastName,
  size = "10",
  textSize = "text-xl",
  className = "",
}) => {
  const firstNameInitial = firstName?.charAt(0)?.toUpperCase();
  const lastNameInitial = lastName?.charAt(0)?.toUpperCase();
  const showInitials = firstNameInitial && lastNameInitial;

  return (
    <div
      className={`w-${size} h-${size} flex items-center justify-center overflow-hidden rounded-full border-2 border-[var(--border-color)] ${className}`}
    >
      {avatarUrl ? (
        <img
          className="h-full w-full object-cover"
          src={avatarUrl}
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
          <span className="material-symbols-outlined text-4xl">sentiment_satisfied</span>
      )}
    </div>
  );
};
