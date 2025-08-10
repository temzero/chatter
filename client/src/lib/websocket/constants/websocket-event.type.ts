export const enum WsNamespace {
  CHAT = "chat",
  PRESENCE = "presence",
  NOTIFICATION = "notification",
}

export const enum ChatEvent {
  // Message Events
  NEW_MESSAGE = "chat:new-message",
  MESSAGE_DELETED = "chat:message-deleted",
  MESSAGE_READ = "chat:message-read",
  MESSAGE_REACTION = "chat:message-reaction",

  // Status Events
  USER_TYPING = "chat:user-typing",
  GET_STATUS = "chat:get-status",
  STATUS_CHANGED = "chat:status-changed",

  // Management Events
  PIN_UPDATED = "chat:pin-updated",
  TOGGLE_IMPORTANT = "chat:toggle-important",
  MESSAGE_IMPORTANT_TOGGLED = "chat:message-important-toggled",

  // Action Events
  TYPING = "chat:typing",
  SEND_MESSAGE = "chat:send-message",
  FORWARD_MESSAGE = "chat:forward-message",
  REACT_TO_MESSAGE = "chat:react-to-message",
  TOGGLE_PIN_MESSAGE = "chat:toggle-pin-message",
  SAVE_MESSAGE = "chat:save-message",
  DELETE_MESSAGE = "chat:delete-message",
  MESSAGE_ERROR = "chat:message-error",
}

export const enum PresenceEvent {
  INIT = "presence:init",
  UPDATE = "presence:update",
  SUBSCRIBE = "presence:subscribe",
  UNSUBSCRIBE = "presence:unsubscribe",
}

export const enum NotificationEvent {
  SUBSCRIBE = "notification:subscribe",
  FRIEND_REQUEST = "notification:friend-request",
  CANCEL_FRIEND_REQUEST = "notification:cancel-friend-request",
  FRIENDSHIP_UPDATE = "notification:friendship-update",
}

export const enum SystemEvent {
  CONNECTION_ACK = "system:connection-ack",
  PING = "system:ping",
  PONG = "system:pong",
  ERROR = "system:error",
}
