export enum CallStatus {
  DIALING = "dialing", // Caller initiated, waiting for answer
  IN_PROGRESS = "in_progress", // Call is active / ongoing
  COMPLETED = "completed", // Call ended normally

  DECLINED = "declined", // Callee rejected the call
  FAILED = "failed", // Call failed due to error/network
}
