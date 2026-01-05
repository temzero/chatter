export enum MessageReadInfoOptions {
  NONE = "none",
  OTHER = "other",
  YOU = "you",
  ALL = "all",
}

export enum MessageStyleOptions {
  CURVED = "curved",
  ROUNDED = "rounded",
  STRAIGHT = "straight",
}

export enum MessageTailOptions {
  NONE = "none",
  STRAIGHT = "straight",
  STRAIGHT_CURVED = "straight-curved",
  POINTED = "pointed",
  CURVED = "curved",
  // CIRCLE = "circle",
}

export const messageTailClasses: Record<MessageTailOptions, string> = {
  [MessageTailOptions.NONE]: "",
  [MessageTailOptions.STRAIGHT]: "message-tail-straight",
  [MessageTailOptions.STRAIGHT_CURVED]: "message-tail-straight-curved",
  [MessageTailOptions.POINTED]: "message-tail-pointed",
  [MessageTailOptions.CURVED]: "message-tail-pointed-curved",
  // [MessageTailOptions.CIRCLE]: "message-tail-circle",
} as const;