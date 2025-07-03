type AvatarProps = {
  avatarUrl?: string | undefined | null;
  name?: string;
  size?: string;
  textSize?: string;
  className?: string;
  id?: number;
  onClick?: () => void;
};

export const Avatar: React.FC<AvatarProps> = ({
  avatarUrl,
  name,
  size = "10",
  textSize = "text-4xl",
  className = "",
  id,
  onClick,
}) => {
  const nameInitial = name?.charAt(0)?.toUpperCase();

  return (
    <div
      key={id}
      className={`w-${size} h-${size} aspect-square flex items-center justify-center overflow-hidden rounded-full border-2 border-[var(--border-color)] ${className}`}
      onClick={onClick}
    >
      {avatarUrl ? (
        <img
          className="h-full w-full object-cover transform transition-transform duration-300 hover:scale-125"
          src={avatarUrl}
          loading="lazy"
          alt="User avatar"
        />
      ) : nameInitial ? (
        <h1
          className={`h-full w-full font-light flex items-center justify-center bg-[var(--border-color)] select-none ${textSize}`}
        >
          {nameInitial}
        </h1>
      ) : (
        <span className="material-symbols-outlined text-4xl">
          sentiment_satisfied
        </span>
      )}
    </div>
  );
};
