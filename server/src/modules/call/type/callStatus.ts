export enum CallStatus {
  COMPLETED = 'completed', // Call ended normally
  DECLINED = 'declined', // Callee rejected the call
  MISSED = 'missed',
  FAILED = 'failed', // Call failed due to error/network
}

export enum PendingCallStatus {
  DIALING = 'dialing', // Caller initiated, waiting for answer
  IN_PROGRESS = 'in_progress', // Call is active / ongoing
}
