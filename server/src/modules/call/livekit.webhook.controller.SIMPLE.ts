// // livekit.webhook.controller.ts
// import { Controller, Post, Body } from '@nestjs/common';
// import { CallService } from './call.service';
// import { CallStatus } from './type/callStatus';
// import { MessageService } from '../message/message.service';
// import { SystemEventType } from '../message/constants/system-event-type.constants';
// import { CallStoreService } from '../websocket/services/call-store.service ';

// interface LivekitWebhookPayload {
//   event: string;
//   room: {
//     name: string;
//     numParticipants?: number;
//     creationTime?: number;
//     [key: string]: unknown;
//   };
//   participant?: {
//     identity: string;
//     [key: string]: unknown;
//   };
//   [key: string]: unknown;
// }

// @Controller('livekit/webhook')
// export class LivekitWebhookController {
//   constructor(
//     private readonly callService: CallService,
//     private readonly callStore: CallStoreService,
//     private readonly messageService: MessageService,
//   ) {}

//   @Post()
//   async handleWebhook(@Body() payload: LivekitWebhookPayload) {
//     const userId = payload.participant?.identity;
//     const roomName = payload.room.name;

//     switch (payload.event) {
//       case 'room_started': {
//         await this.callService.createCall({
//           chatId: roomName,
//           status: CallStatus.DIALING,
//           initiatorUserId: userId || 'system',
//           attendedUserIds: userId ? [userId] : [],
//         });
//         break;
//       }

//       case 'participant_connected': {
//         if (!userId) break;
//         // Track user in ephemeral store
//         this.callStore.addUserToCall(userId, roomName);
//         // Update call in DB
//         const call = await this.callService.getCallById(roomName);
//         if (!call) break;

//         const updatedAttendees = new Set(call.attendedUserIds || []);
//         updatedAttendees.add(userId);

//         await this.callService.updateCall(roomName, {
//           status: CallStatus.IN_PROGRESS,
//           startedAt:
//             call.startedAt || new Date(payload.room.creationTime ?? Date.now()),
//           attendedUserIds: Array.from(updatedAttendees),
//         });
//         break;
//       }

//       case 'participant_disconnected': {
//         if (!userId) break;
//         this.callStore.removeUserFromCall(userId);
//         break;
//       }

//       case 'room_finished': {
//         this.callStore.removeAllUsersFromCall(roomName);

//         const call = await this.callService.getCallById(roomName);
//         if (!call) break;

//         const status =
//           (call.attendedUserIds?.length ?? 1) <= 1
//             ? CallStatus.MISSED
//             : CallStatus.COMPLETED;

//         const endedAt = new Date();
//         const updatedCall = await this.callService.updateCall(roomName, {
//           status,
//           endedAt,
//         });

//         await this.messageService.createSystemEventMessage(
//           call.chat.id,
//           call.initiator.user.id,
//           SystemEventType.CALL,
//           { call: updatedCall },
//         );

//         break;
//       }

//       default:
//         break;
//     }
//   }
// }
