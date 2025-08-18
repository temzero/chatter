export const enum CallEvent {
  // Call lifecycle events
  INITIATE_CALL = 'call:initiate', // or "call:initiated"
  INCOMING_CALL = 'call:incoming',
  UPDATE_CALL = 'call:update',
  ACCEPT_CALL = 'call:accept', // or "call:accepted"
  REJECT_CALL = 'call:reject', // or "call:rejected"
  CANCEL_CALL = 'call:cancel', // or "call:rejected"
  END_CALL = 'call:end', // or "call:ended"
  CALL_TIMEOUT = 'call:timeout',

  // WebRTC signaling events
  OFFER_SDP = 'call:offer', // Explicit about SDP
  ANSWER_SDP = 'call:answer', // Explicit about SDP
  ICE_CANDIDATE = 'call:ice-candidate',

  // Call state events
  CALL_STATE_CHANGE = 'call:state-change',
  PARTICIPANTS_CHANGED = 'call:participants-changed',
}
