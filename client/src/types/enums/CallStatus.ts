export enum CallStatus {
  DIALING = "dialing",
  IN_PROGRESS = "in_progress",

  COMPLETED = "completed",
  MISSED = "missed",
  FAILED = "failed",
}

export enum LocalCallStatus {
  CONNECTING = "connecting",
  CONNECTED = "connected",
  INCOMING = "incoming",
  OUTGOING = "outgoing",
  CANCELED = "canceled",
  REJECTED = "rejected",
  ENDED = "ended",
  ERROR = "error",
}
