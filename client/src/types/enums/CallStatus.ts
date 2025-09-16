export enum CallStatus {
  COMPLETED = "completed",
  DECLINED = "declined",
  MISSED = "missed",
  FAILED = "failed",
}

export enum PendingCallStatus {
  DIALING = "dialing",
  IN_PROGRESS = "in_progress",
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
