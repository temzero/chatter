import { OnlineDot } from "../OnlineDot";
import { Avatar } from "./Avatar";
import type {
  ChatMemberPreview,
  ChatResponse,
} from "@/types/responses/chat.response";

type GroupAvatarProps = {
  chat: ChatResponse;
  type?: "header" | "sidebar" | "info" | "contact";
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

export const GroupAvatar: React.FC<GroupAvatarProps> = ({
  chat,
  styles,
  parentScaleClass,
  childrenScaleClass,
  showOnlineDot,
  isOnline = false,
}) => {
  const members = chat.previewMembers || [];
  const displayMembers = members.slice(0, 4); // Max 4

  return (
    <div
      className={`relative group overflow-hidden ${parentScaleClass} ${styles.size} ${styles.rounded}`}
    >
      {chat.avatarUrl ? (
        <img
          className={`h-full w-full object-cover ${childrenScaleClass} ${styles.rounded}`}
          src={chat.avatarUrl}
          alt={`${chat.name || "Group"}'s avatar`}
          loading="lazy"
        />
      ) : (
        <div
          className={`bg-[var(--border-color)] cursor-pointer h-full w-full ${styles.rounded}`}
        >
          <GroupAvatarLayout members={displayMembers} />
        </div>
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

export const GroupAvatarLayout: React.FC<{
  members: ChatMemberPreview[];
}> = ({ members }) => {
  const length = members.length;
  const textSize = "text-xl";

  if (length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <span className="material-symbols-outlined opacity-50 text-3xl">
          groups
        </span>
      </div>
    );
  }

  if (length === 1) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Avatar
          avatarUrl={members[0].avatarUrl}
          name={members[0].nickname ?? members[0].firstName ?? undefined}
          className={`h-[70%] w-[70%]`}
          textSize={textSize}
        />
      </div>
    );
  }

  if (length === 2) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-full -mr-[1px] flex items-center">
          <Avatar
            avatarUrl={members[0].avatarUrl}
            name={members[0].nickname ?? members[0].firstName ?? undefined}
            className={`h-[50%] w-full`}
            textSize={textSize}
          />
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full -ml-[1px] flex items-center">
          <Avatar
            avatarUrl={members[1].avatarUrl}
            name={members[1].nickname ?? members[1].firstName ?? undefined}
            className={`h-[50%] w-full`}
            textSize={textSize}
          />
        </div>
      </div>
    );
  }

  if (length === 3) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-full -mr-[1px] flex items-center">
          <Avatar
            avatarUrl={members[0].avatarUrl}
            name={members[0].nickname ?? members[0].firstName ?? undefined}
            className={`h-[60%] w-[120%] aspect-square -mr-2`}
            textSize={textSize}
          />
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-1/2 -ml-[1px] -mb-[1px]">
          <Avatar
            avatarUrl={members[1].avatarUrl}
            name={members[1].nickname ?? members[1].firstName ?? undefined}
            className={`h-full w-full`}
            textSize={textSize}
          />
        </div>
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 -ml-[1px] -mt-[1px]">
          <Avatar
            avatarUrl={members[2].avatarUrl}
            name={members[2].nickname ?? members[2].firstName ?? undefined}
            className={`h-full w-full`}
            textSize={textSize}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-0">
      {members.slice(0, 4).map((member, idx) => (
        <div
          key={member.id ?? idx}
          className="flex items-center justify-center overflow-hidden"
        >
          <Avatar
            avatarUrl={member.avatarUrl}
            name={member.nickname ?? member.firstName ?? undefined}
            className={`h-full w-full`}
            textSize={textSize}
          />
        </div>
      ))}
    </div>
  );
};
