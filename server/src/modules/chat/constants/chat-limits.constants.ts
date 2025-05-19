/**
 * Defines all chat-related limits and constraints
 */
export const CHAT_LIMITS = {
  // Chat participants
  MAX_GROUP_PARTICIPANTS: 100,
  MIN_GROUP_PARTICIPANTS: 2,
  MAX_CHANNEL_SUBSCRIBERS: 5000,

  // Message constraints
  MAX_MESSAGE_LENGTH: 2000,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,

  // Rate limits
  MESSAGES_PER_MINUTE: 30,
  REACTIONS_PER_MINUTE: 60,

  // Media constraints
  MAX_PINNED_MESSAGES: 5,
  MAX_INVITES_PER_CHAT: 50,

  // Name constraints
  MIN_CHAT_NAME_LENGTH: 1,
  MAX_CHAT_NAME_LENGTH: 50,
};

export const CHAT_VALIDATION = {
  NAME_REGEX: /^[\p{L}\p{N}\s\-_']+$/u, // Allows letters, numbers, spaces, and basic punctuation
  INVITE_CODE_LENGTH: 16,
};
