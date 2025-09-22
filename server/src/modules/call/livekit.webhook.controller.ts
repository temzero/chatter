// livekit.webhook.controller.ts
import { Controller, Post, Body, RawBodyRequest, Req } from '@nestjs/common';
import { CallService } from './call.service';
import { CallStatus } from './type/callStatus';
import { MessageService } from '../message/message.service';
import { SystemEventType } from '../message/constants/system-event-type.constants';
import { CallStoreService } from '../websocket/services/call-store.service ';
import { WebsocketCallService } from '../websocket/services/websocket-call.service';
import { ChatType } from '../chat/constants/chat-types.constants';

interface LivekitWebhookPayload {
  event: string;
  room: {
    name: string;
    numParticipants?: number;
    creationTime?: number;
    [key: string]: unknown;
  };
  participant?: {
    identity: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

@Controller('livekit/webhook')
export class LivekitWebhookController {
  constructor(
    private readonly callService: CallService,
    private readonly callStore: CallStoreService,
    private readonly messageService: MessageService,
    private readonly websocketCallService: WebsocketCallService,
  ) {}

  @Post()
  // async handleWebhook(@Body() payload: LivekitWebhookPayload) {
  handleWebhook(
    @Body() payload: LivekitWebhookPayload,
    @Req() req: RawBodyRequest<Request>,
  ) {
    // Check if body is completely empty
    if (!req.body || Object.keys(req.body).length === 0) {
      console.warn('[Webhook] Empty request body received');
      return { status: 'ignored', reason: 'empty_body' };
    }

    if (!payload || typeof payload !== 'object') {
      console.warn('[Webhook] Invalid payload received:', payload);
      return { status: 'ignored', reason: 'invalid_payload' };
    }

    const event = payload.event;
    if (!event) {
      console.warn('[Webhook] Event missing in payload:', payload);
      return { status: 'ignored', reason: 'missing_event' };
    }

    // const roomName = payload.room?.name;
    // let userId: string | undefined;

    // if (!roomName) {
    //   console.warn('[Webhook] No room info in payload:', payload);
    //   return;
    // }

    // if (payload.participant) {
    //   userId = payload.participant.identity;
    // }

    switch (event) {
      case 'room_started': {
        const roomName = payload.room?.name;
        if (!roomName) return;
        console.log('[room_started] Room:', roomName);
        // const call = await this.callService.createCall({
        //   chatId: roomName,
        //   status: CallStatus.DIALING,
        //   initiatorUserId: userId || 'system',
        //   attendedUserIds: userId ? [userId] : [],
        // });

        // console.log(
        //   '[room_started] Call created:',
        //   call.id,
        //   'Chat type:',
        //   call.chat.type,
        // );

        // if (userId) {
        //   const isVideoCall = call.chat.type === ChatType.GROUP;
        //   console.log(
        //     '[room_started] Emitting INCOMING_CALL to user:',
        //     userId,
        //     'Video call:',
        //     isVideoCall,
        //   );
        //   await this.websocketCallService.emitIncomingCall(
        //     call.id,
        //     roomName,
        //     userId,
        //     isVideoCall,
        //   );
        // }
        break;
      }

      case 'participant_connected': {
        const roomName = payload.room?.name;
        const userId = payload.participant?.identity;
        if (!roomName || !userId) return;
        console.log('[participant_connected] Room:', roomName, 'User:', userId);

        // if (!userId) break;

        // console.log('[participant_connected] User connected:', userId);
        // this.callStore.addUserToCall(userId, roomName);

        // const call = await this.callService.getActiveCallByChatId(roomName);
        // if (!call) {
        //   console.log(
        //     '[participant_connected] No active call found for room:',
        //     roomName,
        //   );
        //   break;
        // }

        // const updatedAttendees = new Set(call.attendedUserIds || []);
        // updatedAttendees.add(userId);

        // const startedAt =
        //   call.startedAt || new Date(payload.room.creationTime ?? Date.now());

        // await this.callService.updateCall(roomName, {
        //   status: CallStatus.IN_PROGRESS,
        //   startedAt,
        //   attendedUserIds: Array.from(updatedAttendees),
        // });

        // console.log(
        //   '[participant_connected] Updated call status to IN_PROGRESS for call:',
        //   call.id,
        // );

        // await this.websocketCallService.emitUpdateCall(
        //   call.id,
        //   roomName,
        //   CallStatus.IN_PROGRESS,
        //   userId,
        // );

        break;
      }

      case 'participant_disconnected': {
        const roomName = payload.room?.name;
        const userId = payload.participant?.identity;
        if (!roomName || !userId) return;
        console.log(
          '[participant_disconnected] Room:',
          roomName,
          'User:',
          userId,
        );

        // if (!userId) break;
        // console.log('[participant_disconnected] User disconnected:', userId);
        // this.callStore.removeUserFromCall(userId);
        break;
      }

      case 'room_finished': {
        const roomName = payload.room?.name;
        if (!roomName) return;
        console.log('[room_finished] Room:', roomName);

        // console.log('[room_finished] Room finished:', roomName);
        // this.callStore.removeAllUsersFromCall(roomName);

        // const call = await this.callService.getActiveCallByChatId(roomName);
        // if (!call) {
        //   console.log(
        //     '[room_finished] No active call found for room:',
        //     roomName,
        //   );
        //   break;
        // }

        // const status =
        //   (call.attendedUserIds?.length ?? 1) <= 1
        //     ? CallStatus.MISSED
        //     : CallStatus.COMPLETED;

        // const endedAt = new Date();
        // const updatedCall = await this.callService.updateCall(roomName, {
        //   status,
        //   endedAt,
        // });

        // console.log('[room_finished] Call ended:', call.id, 'Status:', status);

        // await this.websocketCallService.emitEndedCall(
        //   call.id,
        //   roomName,
        //   status,
        //   endedAt,
        // );

        // await this.messageService.createSystemEventMessage(
        //   call.chat.id,
        //   call.initiator.user.id,
        //   SystemEventType.CALL,
        //   { call: updatedCall },
        // );

        break;
      }

      default:
        console.log('[Webhook] Unknown event:', payload.event);
        break;
    }
  }
}
