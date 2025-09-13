// import { Injectable, OnModuleDestroy } from '@nestjs/common';
// import { CallResponse } from '../constants/callPayload.type';

// export interface CallState {
//   chatId: string;
//   isVideoCall: boolean;
//   isGroupCall: boolean;
//   memberIds: Set<string>; // memberIds currently in call
//   startTime?: number;
//   callAt: number; // When the call was first initiated
// }

// @Injectable()
// export class WebsocketCallService implements OnModuleDestroy {
//   private readonly callStates = new Map<string, CallState>(); // key: chatId
//   private readonly callCleanupInterval: NodeJS.Timeout;

//   constructor() {
//     this.callCleanupInterval = setInterval(
//       () => this.cleanupExpiredCalls(),
//       30000, // Check every 30 seconds
//     );
//   }

//   onModuleDestroy() {
//     clearInterval(this.callCleanupInterval);
//   }

//   // Initialize a call (caller starts the call)
//   initiateCall(
//     chatId: string,
//     callData: CallResponse,
//     initiatorMemberId: string,
//   ): void {
//     const callState: CallState = {
//       chatId,
//       isVideoCall: callData.isVideoCall,
//       isGroupCall: callData.isGroupCall,
//       memberIds: new Set([initiatorMemberId]), // Caller is the first participant
//       callAt: Date.now(),
//     };

//     this.callStates.set(chatId, callState);
//   }

//   // Add participant to call
//   addParticipant(chatId: string, memberId: string): void {
//     const callState = this.callStates.get(chatId);
//     if (callState) {
//       callState.memberIds.add(memberId);

//       // Set start time when first participant joins (other than initiator)
//       if (callState.memberIds.size > 1 && !callState.startTime) {
//         callState.startTime = Date.now();
//       }
//     }
//   }

//   // Remove participant from call
//   removeParticipant(chatId: string, memberId: string): boolean {
//     const callState = this.callStates.get(chatId);
//     if (!callState) return false;

//     callState.memberIds.delete(memberId);

//     // Check if call has ended (only initiator left or empty)
//     const callEnded = callState.memberIds.size <= 1;

//     if (callEnded) {
//       this.callStates.delete(chatId);
//       return true; // Call ended
//     }

//     return false; // Call still active
//   }

//   // Get call state
//   getCallState(chatId: string): CallState | undefined {
//     return this.callStates.get(chatId);
//   }

//   // Get the initiator member ID (first member in the set)
//   getInitiatorMemberId(chatId: string): string | undefined {
//     const callState = this.callStates.get(chatId);
//     if (!callState || callState.memberIds.size === 0) return undefined;

//     // Return the first member in the set (the initiator)
//     return Array.from(callState.memberIds)[0];
//   }

//   // Check if call is pending (only initiator is present)
//   isCallPending(chatId: string): boolean {
//     const callState = this.callStates.get(chatId);
//     return callState ? callState.memberIds.size === 1 : false;
//   }

//   // Check if call is active (multiple participants)
//   isCallActive(chatId: string): boolean {
//     const callState = this.callStates.get(chatId);
//     return callState ? callState.memberIds.size > 1 : false;
//   }

//   // End call completely
//   endCall(chatId: string): void {
//     this.callStates.delete(chatId);
//   }

//   // Get all pending calls for a user (where user is not the initiator)
//   getPendingCallsForUser(userId: string, userMemberIds: string[]): CallState[] {
//     const pendingCalls: CallState[] = [];
//     const now = Date.now();
//     const oneMinuteAgo = now - 60000;

//     this.callStates.forEach((callState) => {
//       // Call is pending if only initiator is present, not expired, and user is not the initiator
//       if (
//         callState.memberIds.size === 1 &&
//         callState.callAt >= oneMinuteAgo &&
//         !userMemberIds.includes(Array.from(callState.memberIds)[0])
//       ) {
//         pendingCalls.push(callState);
//       }
//     });

//     return pendingCalls;
//   }

//   // Clean up expired calls (pending calls that weren't answered)
//   private cleanupExpiredCalls(): void {
//     const now = Date.now();
//     const expiredChatIds: string[] = [];

//     this.callStates.forEach((callState, chatId) => {
//       // Remove calls that are pending and expired (older than 1 minute)
//       if (callState.memberIds.size === 1 && now - callState.callAt > 60000) {
//         expiredChatIds.push(chatId);
//       }
//     });

//     expiredChatIds.forEach((chatId) => this.callStates.delete(chatId));
//   }
// }
