export enum ChatMemberRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
  GUEST = "guest",
}

export const rolePriority = {
  [ChatMemberRole.OWNER]: 1,
  [ChatMemberRole.ADMIN]: 2,
  [ChatMemberRole.GUEST]: 3,
  [ChatMemberRole.MEMBER]: 4,
};
