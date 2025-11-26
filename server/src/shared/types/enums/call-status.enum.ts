export enum CallStatus {
  DIALING = 'dialing', // caller initiated
  IN_PROGRESS = 'in_progress', // call connected

  COMPLETED = 'completed', // Call ended normally
  MISSED = 'missed',
  FAILED = 'failed', // Call failed due to error/network
}
