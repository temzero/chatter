// // src/calls/call.gateway.ts
// import {
//   ConnectedSocket,
//   MessageBody,
//   SubscribeMessage,
//   WebSocketGateway,
// } from '@nestjs/websockets';
// import { AuthenticatedSocket } from '../constants/authenticatedSocket.type';
// import { CallEvent } from '../constants/websocket-events';
// import {
//   InitiateCallRequest,
//   IncomingCallResponse,
//   CallActionRequest,
//   CallActionResponse,
//   RtcOfferRequest,
//   RtcOfferResponse,
//   RtcAnswerRequest,
//   RtcAnswerResponse,
//   IceCandidateRequest,
//   IceCandidateResponse,
//   UpdateCallPayload,
//   CallMemberPayload,
// } from '../constants/callPayload.type';
// import { ChatMemberService } from 'src/modules/chat-member/chat-member.service';
// import { ChatService } from 'src/modules/chat/chat.service';
// import { WebsocketNotificationService } from '../services/websocket-notification.service';
// import { WebsocketCallService } from '../services/websocket-call.service';
// import { MessageService } from 'src/modules/message/message.service';
// import { CallService } from 'src/modules/call/call.service';
// import { CallStatus } from 'src/modules/call/type/callStatus';

// @WebSocketGateway()
// export class CallGateway {
//   constructor(
//     private readonly websocketNotificationService: WebsocketNotificationService,
//     private readonly websocketCallService: WebsocketCallService,
//     private readonly chatMemberService: ChatMemberService,
//     private readonly chatService: ChatService,
//     private readonly callService: CallService,
//     private readonly messageService: MessageService,
//   ) {}

//   // /**
//   //  * Clear pending calls for all participants in a chat
//   //  * @param chatId - The chat ID
//   //  * @param userId - The user ID initiating the action
//   //  */
//   // private async clearPendingCalls(chatId: string) {
//   //   // The new service handles cleanup automatically, so we just end the call
//   //   this.websocketCallService.endCall(chatId);
//   // }

//   // @SubscribeMessage(CallEvent.PENDING_CALLS)
//   // async handleRequestPendingCalls(
//   //   @ConnectedSocket() client: AuthenticatedSocket,
//   // ) {
//   //   const userId = client.data.userId;

//   //   // Get user's member IDs across all chats
//   //   const userChatsResult = await this.chatService.getUserChats(userId);
//   //   const userMemberIds = await Promise.all(
//   //     userChatsResult.chats.map((chat) =>
//   //       this.chatMemberService.getChatMemberId(chat.id, userId),
//   //     ),
//   //   );

//   //   // Get pending calls where user is not the initiator
//   //   const pendingCalls = this.websocketCallService.getPendingCallsForUser(
//   //     userId,
//   //     userMemberIds,
//   //   );

//   //   // Convert CallState to IncomingCallResponse format
//   //   const pendingCallResponses: IncomingCallResponse[] = pendingCalls.map(
//   //     (callState) => ({
//   //       id: callState.id,
//   //       chatId: callState.chatId,
//   //       isVideoCall: callState.isVideoCall,
//   //       isGroupCall: callState.isGroupCall,
//   //       memberId: Array.from(callState.memberIds)[0], // Initiator is first member
//   //       timestamp: callState.callAt,
//   //     }),
//   //   );

//   //   client.emit(CallEvent.PENDING_CALLS, pendingCallResponses);
//   // }

//   @SubscribeMessage(CallEvent.INITIATE_CALL)
//   async handleCallInitiate(
//     @ConnectedSocket() client: AuthenticatedSocket,
//     @MessageBody() payload: InitiateCallRequest,
//   ) {
//     console.log('INITIATE_CALL');
//     const userId = client.data.userId;
//     const memberId = await this.chatMemberService.getChatMemberId(
//       payload.chatId,
//       userId,
//     );

//     const response: IncomingCallResponse = {
//       chatId: payload.chatId,
//       isVideoCall: payload.isVideoCall,
//       isGroupCall: payload.isGroupCall,
//       memberId,
//       timestamp: Date.now(),
//     };

//     // Initialize call in the call service
//     this.websocketCallService.initiateCall(payload.chatId, response, memberId);

//     await this.callService.createCall({
//       chatId: payload.chatId,
//       initiatorId: userId,
//       initiatorMemberId: memberId,
//       isVideoCall: payload.isVideoCall,
//       isGroupCall: payload.isGroupCall,
//       status: CallStatus.DIALING,
//     });

//     // Notify all online chat members except the caller
//     await this.websocketNotificationService.emitToChatMembers(
//       payload.chatId,
//       CallEvent.INCOMING_CALL,
//       response,
//       { senderId: userId, excludeSender: true },
//     );
//   }

//   @SubscribeMessage(CallEvent.UPDATE_CALL)
//   async handleUpdate(
//     @ConnectedSocket() client: AuthenticatedSocket,
//     @MessageBody() payload: UpdateCallPayload,
//   ) {
//     const userId = client.data.userId;

//     // find active call for this chat
//     const activeCalls = await this.callService.getCallsByChatId(payload.chatId);
//     if (activeCalls.length === 0) {
//       throw new Error(`No active call found for chat ${payload.chatId}`);
//     }
//     const call = activeCalls[0];

//     // persist update in DB
//     const updatedCall = await this.callService.updateCall(call.id, {
//       isVideoCall: payload.isVideoCall,
//       status: payload.callStatus, // optional: allow frontend to send status updates
//     });

//     // broadcast updated call to all members
//     await this.websocketNotificationService.emitToChatMembers(
//       payload.chatId,
//       CallEvent.UPDATE_CALL,
//       updatedCall,
//       { senderId: userId, excludeSender: false },
//     );
//   }

//   @SubscribeMessage(CallEvent.UPDATE_CALL_MEMBER)
//   async handleCallMemberUpdate(
//     @ConnectedSocket() client: AuthenticatedSocket,
//     @MessageBody() payload: CallMemberPayload,
//   ) {
//     const userId = client.data.userId;

//     // Verify the member making the update is the same as the one in the payload
//     const userMemberId = await this.chatMemberService.getChatMemberId(
//       payload.chatId,
//       userId,
//     );

//     console.log(
//       'userMemberId',
//       userMemberId,
//       'payload.memberId',
//       payload.memberId,
//     );

//     if (userMemberId !== payload.memberId) {
//       throw new Error('Unauthorized: Cannot update other members');
//     }

//     await this.websocketNotificationService.emitToChatMembers(
//       payload.chatId,
//       CallEvent.UPDATE_CALL_MEMBER,
//       payload,
//       { senderId: userId, excludeSender: false },
//     );
//   }

//   @SubscribeMessage(CallEvent.ACCEPT_CALL)
//   async handleCallAccept(
//     @ConnectedSocket() client: AuthenticatedSocket,
//     @MessageBody() payload: CallActionRequest,
//   ) {
//     const userId = client.data.userId;
//     const memberId = await this.chatMemberService.getChatMemberId(
//       payload.chatId,
//       userId,
//     );

//     const response: CallActionResponse = {
//       chatId: payload.chatId,
//       memberId,
//       timestamp: Date.now(),
//       isCallerCancel: payload.isCallerCancel,
//     };

//     // Add user to the call participants (in-memory state)
//     this.websocketCallService.addParticipant(payload.chatId, memberId);

//     // Update DB call status to IN_PROGRESS
//     const activeCall = await this.callService.getActiveCallByChatId(
//       payload.chatId,
//     );
//     if (activeCall) {
//       await this.callService.updateCall(activeCall.id, {
//         status: CallStatus.IN_PROGRESS,
//       });
//     }

//     // Emit to other members
//     await this.websocketNotificationService.emitToChatMembers(
//       payload.chatId,
//       CallEvent.ACCEPT_CALL,
//       response,
//       { senderId: userId, excludeSender: true },
//     );
//   }

//   @SubscribeMessage(CallEvent.JOIN_CALL)
//   async handleJoinCall(
//     @ConnectedSocket() client: AuthenticatedSocket,
//     @MessageBody() payload: { chatId: string },
//   ) {
//     const userId = client.data.userId;
//     const memberId = await this.chatMemberService.getChatMemberId(
//       payload.chatId,
//       userId,
//     );

//     if (!memberId) {
//       throw new Error('User is not a member of this chat');
//     }

//     // Add user to the call participants (in-memory state)
//     this.websocketCallService.addParticipant(payload.chatId, memberId);

//     // Ensure DB call remains IN_PROGRESS
//     const activeCall = await this.callService.getActiveCallByChatId(
//       payload.chatId,
//     );
//     if (activeCall) {
//       await this.callService.updateCall(activeCall.id, {
//         status: CallStatus.IN_PROGRESS,
//       });
//     }

//     const response = {
//       chatId: payload.chatId,
//       memberId,
//       timestamp: Date.now(),
//     };

//     await this.websocketNotificationService.emitToChatMembers(
//       payload.chatId,
//       CallEvent.JOIN_CALL,
//       response,
//       { senderId: userId, excludeSender: false },
//     );
//   }

//   @SubscribeMessage(CallEvent.DECLINE_CALL)
//   async handleCallReject(
//     @ConnectedSocket() client: AuthenticatedSocket,
//     @MessageBody() payload: CallActionRequest,
//   ) {
//     const userId = client.data.userId;
//     const memberId = await this.chatMemberService.getChatMemberId(
//       payload.chatId,
//       userId,
//     );

//     const response: CallActionResponse = {
//       chatId: payload.chatId,
//       memberId,
//       timestamp: Date.now(),
//       isCallerCancel: payload.isCallerCancel,
//     };

//     // Update DB call status to DECLINED
//     const activeCall = await this.callService.getActiveCallByChatId(
//       payload.chatId,
//     );
//     if (activeCall) {
//       await this.callService.updateCall(activeCall.id, {
//         status: CallStatus.DECLINED,
//         endedAt: new Date(),
//       });
//     }

//     // Clear call if only participant
//     const callState = this.websocketCallService.getCallState(payload.chatId);
//     if (callState && callState.memberIds.size === 1) {
//       this.websocketCallService.endCall(payload.chatId);
//     }

//     await this.websocketNotificationService.emitToChatMembers(
//       payload.chatId,
//       CallEvent.DECLINE_CALL,
//       response,
//       { senderId: userId, excludeSender: true },
//     );
//   }

//   @SubscribeMessage(CallEvent.HANG_UP)
//   async handleHangup(
//     @ConnectedSocket() client: AuthenticatedSocket,
//     @MessageBody() payload: CallActionRequest,
//   ) {
//     const userId = client.data.userId;
//     const memberId = await this.chatMemberService.getChatMemberId(
//       payload.chatId,
//       userId,
//     );

//     const response: CallActionResponse = {
//       chatId: payload.chatId,
//       memberId,
//       timestamp: Date.now(),
//     };

//     // If caller cancels, delete call + system messages
//     if (payload.isCallerCancel) {
//       try {
//         const activeCall = await this.callService.getActiveCallByChatId(
//           payload.chatId,
//         );
//         if (activeCall) {
//           await this.callService.deleteCallAndSystemMessage(activeCall.id);
//         }
//       } catch (err) {
//         console.error('Failed to delete call or system messages:', err);
//       }
//     } else {
//       // Otherwise update call to COMPLETED
//       const activeCall = await this.callService.getActiveCallByChatId(
//         payload.chatId,
//       );
//       if (activeCall) {
//         await this.callService.updateCall(activeCall.id, {
//           status: CallStatus.COMPLETED,
//           endedAt: new Date(),
//         });
//       }
//     }

//     // Remove from in-memory participants
//     const callEnded = this.websocketCallService.removeParticipant(
//       payload.chatId,
//       memberId,
//     );

//     if (callEnded) {
//       await this.websocketNotificationService.emitToChatMembers(
//         payload.chatId,
//         CallEvent.END_CALL,
//         { chatId: payload.chatId, endedBy: memberId },
//         { senderId: userId, excludeSender: false },
//       );
//     }

//     await this.websocketNotificationService.emitToChatMembers(
//       payload.chatId,
//       CallEvent.HANG_UP,
//       response,
//       { senderId: userId, excludeSender: true },
//     );
//   }

//   @SubscribeMessage(CallEvent.P2P_OFFER_SDP)
//   async handleP2PWebRtcOffer(
//     @ConnectedSocket() client: AuthenticatedSocket,
//     @MessageBody() payload: RtcOfferRequest,
//   ) {
//     const userId = client.data.userId;
//     const memberId = await this.chatMemberService.getChatMemberId(
//       payload.chatId,
//       userId,
//     );

//     const response: RtcOfferResponse = {
//       chatId: payload.chatId,
//       offer: payload.offer,
//       memberId,
//     };

//     await this.websocketNotificationService.emitToChatMembers(
//       payload.chatId,
//       CallEvent.P2P_OFFER_SDP,
//       response,
//       { senderId: userId, excludeSender: true },
//     );
//   }

//   @SubscribeMessage(CallEvent.P2P_ANSWER_SDP)
//   async handleRtcAnswer(
//     @ConnectedSocket() client: AuthenticatedSocket,
//     @MessageBody() payload: RtcAnswerRequest,
//   ) {
//     const userId = client.data.userId;
//     const memberId = await this.chatMemberService.getChatMemberId(
//       payload.chatId,
//       userId,
//     );

//     const response: RtcAnswerResponse = {
//       chatId: payload.chatId,
//       answer: payload.answer,
//       memberId,
//     };

//     await this.websocketNotificationService.emitToChatMembers(
//       payload.chatId,
//       CallEvent.P2P_ANSWER_SDP,
//       response,
//       { senderId: userId, excludeSender: true },
//     );
//   }

//   @SubscribeMessage(CallEvent.ICE_CANDIDATE)
//   async handleRtcIceCandidate(
//     @ConnectedSocket() client: AuthenticatedSocket,
//     @MessageBody() payload: IceCandidateRequest,
//   ) {
//     const userId = client.data.userId;
//     const memberId = await this.chatMemberService.getChatMemberId(
//       payload.chatId,
//       userId,
//     );

//     const response: IceCandidateResponse = {
//       chatId: payload.chatId,
//       candidate: payload.candidate,
//       memberId,
//     };

//     await this.websocketNotificationService.emitToChatMembers(
//       payload.chatId,
//       CallEvent.ICE_CANDIDATE,
//       response,
//       {
//         senderId: userId,
//         excludeSender: true,
//       },
//     );
//   }
// }
