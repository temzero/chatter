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
  CHECK_BROADCAST = "check_broadcast",
  TIMEOUT = "timeout",
  CANCELED = "canceled",
  DECLINED = "declined",
  ENDED = "ended",
  ERROR = "error",
}
