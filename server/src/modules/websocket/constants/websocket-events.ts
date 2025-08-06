export const enum WsNamespace {
  CHAT = 'chat',
  PRESENCE = 'presence',
  NOTIFICATION = 'notification',
}

export const enum ChatEvent {
  // Message Events
  NEW_MESSAGE = 'chat:new-message',
  MESSAGE_DELETED = 'chat:message-deleted',
  MESSAGE_READ = 'chat:message-read',
  MESSAGE_REACTION = 'chat:message-reaction',

  // Status Events
  USER_TYPING = 'chat:user-typing',
  GET_STATUS = 'chat:get-status',

  // Management Events
  PIN_UPDATED = 'chat:pin-updated',
  TOGGLE_IMPORTANT = 'chat:toggle-important',

  // Additional Events from your code
  TYPING = 'chat:typing',
  SEND_MESSAGE = 'chat:sendMessage',
  FORWARD_MESSAGE = 'chat:forwardMessage',
  REACT_TO_MESSAGE = 'chat:reactToMessage',
  TOGGLE_PIN_MESSAGE = 'chat:togglePinMessage',
  SAVE_MESSAGE = 'chat:saveMessage',
  DELETE_MESSAGE = 'chat:deleteMessage',
  MESSAGE_ERROR = 'chat:messageError',
  MESSAGE_IMPORTANT_TOGGLED = 'chat:messageImportantToggled',
}

export const enum PresenceEvent {
  INIT = 'presence:init',
  UPDATE = 'presence:update',
  SUBSCRIBE = 'presence:subscribe',
  UNSUBSCRIBE = 'presence:unsubscribe',
}

export const enum NotificationEvent {
  FRIEND_REQUEST = 'notification:friend-request',
  SUBSCRIBE = 'notification:subscribe',
}

export const enum SystemEvent {
  CONNECTION_ACK = 'system:connection-ack',
  PING = 'system:ping',
  PONG = 'system:pong',
  ERROR = 'system:error',
}
