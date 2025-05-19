/**
 * Defines all WebSocket event names for real-time chat features
 */
export const CHAT_EVENTS = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',

  // Message events
  MESSAGE_CREATED: 'message_created',
  MESSAGE_UPDATED: 'message_updated',
  MESSAGE_DELETED: 'message_deleted',
  MESSAGE_READ: 'message_read',
  MESSAGE_TYPING: 'user_typing',

  // Reaction events
  REACTION_ADDED: 'reaction_added',
  REACTION_REMOVED: 'reaction_removed',

  // Chat events
  CHAT_CREATED: 'chat_created',
  CHAT_UPDATED: 'chat_updated',
  CHAT_DELETED: 'chat_deleted',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  USER_BANNED: 'user_banned',
  USER_UNBANNED: 'user_unbanned',
  USER_PROMOTED: 'user_promoted',
  USER_DEMOTED: 'user_demoted',

  // Presence events
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  USER_AWAY: 'user_away',

  // Notification events
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATION_READ: 'notification_read',

  // Error events
  ERROR: 'error',
  UNAUTHORIZED: 'unauthorized',
  RATE_LIMITED: 'rate_limited',
};

/**
 * Client-initiated event names
 */
export const CLIENT_EVENTS = {
  JOIN_CHAT: 'join_chat',
  LEAVE_CHAT: 'leave_chat',
  MARK_AS_READ: 'mark_as_read',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
};

/**
 * Event payload interfaces would typically be defined in a separate types file
 */
