import { OnlineDot } from "../OnlineDot";
import { Avatar } from "./Avatar";
import type {
  ChatMemberLite,
  ChatResponse,
} from "@/shared/types/responses/chat.response";

type GroupAvatarProps = {
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

export const GroupAvatar: React.FC<GroupAvatarProps> = ({
  chat,
  styles,
  parentScaleClass,
  childrenScaleClass,
  showOnlineDot,
  isOnline = false,
}) => {
  const members = chat.previewMembers || [];
  const displayMembers = members.slice(0, 8); // Max 8

  return (
    <div
      className={`relative group overflow-hidden bg-[var(--border-color)] flex items-center justify-center ${parentScaleClass} ${styles.size} ${styles.rounded} `}
    >
      {chat.avatarUrl ? (
        <img
          className={`h-full w-full object-cover ${childrenScaleClass} ${styles.rounded}`}
          src={chat.avatarUrl}
          alt={`${chat.name || "Group"}'s avatar`}
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
  members: ChatMemberLite[];
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

  if (length === 4) {
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
  }

  // For length >= 4
  // 4 is normal 2x2 grid
  // 5,6,7 show first 3 normal squares + last square is smaller avatars of the rest

  if (length >= 4 && length <= 7) {
    // first 3 members are normal squares, each 1/4
    // last square is the container of the remaining avatars (members.slice(3))
    // The last square is bottom-right corner

    const overflowMembers = members.slice(3);

    return (
      <div className="grid grid-cols-2 grid-rows-2 h-full w-full gap-0">
        {/* First avatar top-left */}
        <div className="flex items-center justify-center overflow-hidden">
          <Avatar
            avatarUrl={members[0].avatarUrl}
            name={members[0].nickname ?? members[0].firstName ?? undefined}
            className="h-full w-full"
            textSize={textSize}
          />
        </div>

        {/* Second avatar top-right */}
        <div className="flex items-center justify-center overflow-hidden">
          <Avatar
            avatarUrl={members[1].avatarUrl}
            name={members[1].nickname ?? members[1].firstName ?? undefined}
            className="h-full w-full"
            textSize={textSize}
          />
        </div>

        {/* Third avatar bottom-left */}
        <div className="flex items-center justify-center overflow-hidden">
          <Avatar
            avatarUrl={members[2].avatarUrl}
            name={members[2].nickname ?? members[2].firstName ?? undefined}
            className="h-full w-full"
            textSize={textSize}
          />
        </div>

        {/* Last square bottom-right */}
        <div className="grid grid-cols-2 grid-rows-2 gap-0.5 overflow-hidden p-0.5">
          {overflowMembers.slice(0, 4).map((member, idx) => {
            // Check if this is the 4th member and if there are more than 4 members
            const isLastAndMore = idx === 3 && overflowMembers.length > 4;

            return (
              <div
                key={member.id ?? idx}
                className="relative flex items-center justify-center overflow-hidden rounded-full w-full h-full"
              >
                <Avatar
                  avatarUrl={member.avatarUrl}
                  name={member.nickname ?? member.firstName ?? undefined}
                  className="h-full w-full"
                  textSize="text-xs"
                />
                {isLastAndMore && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-full text-white text-xl font-bold">
                    ...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
};
