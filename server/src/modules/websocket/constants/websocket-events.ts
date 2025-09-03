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
  STATUS_CHANGED = 'chat:status-changed',

  // Management Events
  PIN_UPDATED = 'chat:pin-updated',
  TOGGLE_IMPORTANT = 'chat:toggle-important',
  MESSAGE_IMPORTANT_TOGGLED = 'chat:message-important-toggled',

  // Member Events
  MEMBER_ADDED = 'chat:member-added',
  MEMBER_REMOVED = 'chat:member-removed',

  // Action Events
  TYPING = 'chat:typing',
  SEND_MESSAGE = 'chat:send-message',
  FORWARD_MESSAGE = 'chat:forward-message',
  REACT_TO_MESSAGE = 'chat:react-to-message',
  TOGGLE_PIN_MESSAGE = 'chat:toggle-pin-message',
  SAVE_MESSAGE = 'chat:save-message',
  DELETE_MESSAGE = 'chat:delete-message',
  MESSAGE_ERROR = 'chat:message-error',
}

export const enum CallEvent {
  // ============ USED BY BOTH P2P & SFU ============
  // Call lifecycle events (common to both architectures)
  PENDING_CALLS = 'call:pending', // 📞 BOTH: Check for pending calls
  INITIATE_CALL = 'call:initiate', // 📞 BOTH: Start a new call
  INCOMING_CALL = 'call:incoming', // 📞 BOTH: Receive incoming call notification
  UPDATE_CALL = 'call:update', // 📞 BOTH: Update call state/metadata
  UPDATE_CALL_MEMBER = 'call:update-member', // 📞 BOTH: Update participant status
  ACCEPT_CALL = 'call:accept', // 📞 BOTH: Accept an incoming call
  JOIN_CALL = 'call:join', // 📞 BOTH: Join a call (P2P: rarely used, SFU: essential)
  REJECT_CALL = 'call:reject', // 📞 BOTH: Reject an incoming call
  CANCEL_CALL = 'call:cancel', // 📞 BOTH: Cancel outgoing call
  HANG_UP = 'call:hang-up', // 📞 BOTH: Hang up from ongoing call
  END_CALL = 'call:end', // 📞 BOTH: End call completely
  CALL_TIMEOUT = 'call:timeout', // 📞 BOTH: Call timeout notification
  CALL_STATE_CHANGE = 'call:state-change', // 📞 BOTH: General call state changes

  // ============ PRIMARILY FOR P2P DIRECT CALLS ============
  // WebRTC signaling events (direct peer-to-peer connection)
  P2P_OFFER_SDP = 'call:p2p_offer', // 🔗 P2P: WebRTC offer for direct connection
  P2P_ANSWER_SDP = 'call:p2p_answer', // 🔗 P2P: WebRTC answer for direct connection
  ICE_CANDIDATE = 'call:ice-candidate', // 🔗 P2P: ICE candidates for NAT traversal

  // ============ PRIMARILY FOR SFU GROUP CALLS ============
  PARTICIPANTS_CHANGED = 'call:participants-changed', // 🎥 SFU: Participants list changed (more critical for groups)
  SFU_ICE_CANDIDATE = 'call:sfu-ice-candidate', // 🎥 SFU: ICE candidates for SFU connection
}

export const enum PresenceEvent {
  INIT = 'presence:init',
  UPDATE = 'presence:update',
  SUBSCRIBE = 'presence:subscribe',
  UNSUBSCRIBE = 'presence:unsubscribe',
}

export const enum NotificationEvent {
  SUBSCRIBE = 'notification:subscribe',
  FRIEND_REQUEST = 'notification:friend-request',
  CANCEL_FRIEND_REQUEST = 'notification:cancel-friend-request',
  FRIENDSHIP_UPDATE = 'notification:friendship-update',
}

export const enum SystemEvent {
  CONNECTION_ACK = 'system:connection-ack',
  PING = 'system:ping',
  PONG = 'system:pong',
  ERROR = 'system:error',
}
