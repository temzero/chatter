// components/AvatarEdit.tsx
import React from "react";

interface AvatarEditProps {
  avatar: string;
  type?: string;
  onAvatarChange: (newAvatar: string) => void;
}

const AvatarEdit: React.FC<AvatarEditProps> = ({
  avatar,
  onAvatarChange,
  type,
}) => {
  let typeClass = `h-36 w-36`;
  if (type === "group") {
    typeClass += " rounded-[28px] border-2";
  } else if (type === "channel") {
    typeClass += " rounded-[28px] border-[6px]";
  } else {
    typeClass += " rounded-full border-2";
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onAvatarChange(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      id="change-avatar"
      className={`${typeClass} flex items-center justify-center border-[var(--border-color)] overflow-hidden relative`}
    >
      {avatar ? (
        <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
      ) : (
        <i className="material-symbols-outlined text-8xl opacity-20">
          {type === "group" ? "groups" : type === "channel" ? "tv" : "person"}
        </i>
      )}
      <label className="absolute inset-0 flex items-center justify-center text-white bg-black/50 cursor-pointer opacity-0 hover:opacity-100">
        <i className="material-symbols-outlined text-2xl">edit</i>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default AvatarEdit;
