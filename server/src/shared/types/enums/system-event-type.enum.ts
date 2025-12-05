export enum SystemEventType {
  CHAT_CREATED = 'chat_created',
  CHAT_UPDATE_AVATAR = 'chat_update_avatar',
  CHAT_UPDATE_DESCRIPTION = 'chat_update_description',
  CHAT_RENAMED = 'chat_renamed',
  CHAT_DELETED = 'chat_deleted',

  MEMBER_JOINED = 'member_joined',
  MEMBER_ADDED = 'member_added',
  MEMBER_LEFT = 'member_left',
  MEMBER_KICKED = 'member_kicked',
  MEMBER_BANNED = 'member_banned',
  MEMBER_UPDATE_NICKNAME = 'member_update_nickname',
  MEMBER_UPDATE_ROLE = 'member_update_role',
  MEMBER_UPDATE_STATUS = 'member_update_status',

  MESSAGE_PINNED = 'message_pinned',
  MESSAGE_UNPINNED = 'message_unpinned',
}
