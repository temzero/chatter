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

  // Member Events
  MEMBER_ADDED = "chat:member-added",
  MEMBER_REMOVED = "chat:member-removed",

  // Action Events
  TYPING = "chat:typing",
  SEND_MESSAGE = "chat:send-message",
  FORWARD_MESSAGE = "chat:forward-message",
  REACT_TO_MESSAGE = "chat:react-to-message",
  TOGGLE_PIN_MESSAGE = "chat:toggle-pin-message",
  SAVE_MESSAGE = "chat:save-message",
  UPDATE_MESSAGE = "chat:update-message",
  DELETE_MESSAGE = "chat:delete-message",
  MESSAGE_ERROR = "chat:message-error",
}

export const enum CallEvent {
  INITIATE_CALL = "call:initiate", // 📞 BOTH: Start a new call
  INCOMING_CALL = "call:incoming", // 📞 BOTH: Receive incoming call notification
  START_CALL = "call:start",
  UPDATE_CALL = "call:update", // 📞 BOTH: Update call state/metadata
  JOIN_CALL = "call:join", // 📞 BOTH: Join a call (P2P: rarely used, SFU: essential)
  DECLINE_CALL = "call:declined", // 📞 BOTH: Reject an incoming call
  HANG_UP = "call:hang-up", // 📞 BOTH: Hang up from ongoing call
  CALL_ENDED = "call:ended",
  CALL_ERROR = "call:error",
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
