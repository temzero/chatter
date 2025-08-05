export enum SystemEventType {
  MEMBER_JOINED = 'member_joined',
  MEMBER_LEFT = 'member_left',
  MEMBER_KICKED = 'member_kicked',
  MEMBER_BANNED = 'member_banned',
  MEMBER_UPDATE_NICKNAME = 'member_update_nickname',
  MEMBER_UPDATE_ROLE = 'member_update_role',
  MEMBER_UPDATE_STATUS = 'member_update_status',
  CHAT_UPDATE_AVATAR = 'chat_update_avatar',
  CHAT_UPDATE_DESCRIPTION = 'chat_update_description',
  CHAT_RENAMED = 'chat_renamed',

  MESSAGE_PINNED = 'message_pinned',
  MESSAGE_UNPINNED = 'message_unpinned',
  CHAT_DELETED = 'chat_deleted',
}
