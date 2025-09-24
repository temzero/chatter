// livekit.webhook.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { CallService } from './call.service';
import { CallStatus } from './type/callStatus';
import { MessageService } from '../message/message.service';
import { SystemEventType } from '../message/constants/system-event-type.constants';
import { CallStoreService } from '../websocket/services/call-store.service ';
import { WebsocketCallService } from '../websocket/services/websocket-call.service';
import { ValidateWebhookPipe } from 'src/common/pipes/validate-webhook.pipe';
import { ChatType } from '../chat/constants/chat-types.constants';

export interface LivekitWebhookPayload {
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
  async handleWebhook(
    @Body(ValidateWebhookPipe) payload: LivekitWebhookPayload,
  ) {
    const roomName = payload.room?.name;
    if (!roomName) {
      console.warn('[Webhook] No room info in payload:', payload);
      return;
    }

    switch (payload.event) {
      case 'room_started': {
        console.log('[room_started] Room:', roomName);
        break;
      }

      case 'participant_joined': {
        const userId = payload.participant?.identity;
        const participantName = payload.participant?.name;
        if (!userId) {
          console.log(
            '[participant_joined] No participant identity found in payload',
          );
          return;
        }

        console.log('[participant_joined]', participantName);

        // Try to find an active call by roomName
        let call = await this.callService.getActiveCallByChatId(roomName);
        console.log(
          '[participant_joined] Existing call:',
          call ? call.id : 'None',
        );

        if (!call) {
          // ------------------------------
          // 1) FIRST PARTICIPANT (initiator)
          // ------------------------------
          console.log('[participant_joined] 1st participant');
          call = await this.callService.createCall({
            chatId: roomName,
            status: CallStatus.DIALING,
            initiatorUserId: userId,
          });

          const isVideoCall = call.chat?.type === ChatType.GROUP;

          await this.websocketCallService.emitIncomingCall(
            call.id,
            roomName,
            userId,
            isVideoCall,
          );
        } else if (
          call.attendedUserIds.length === 1 &&
          call.attendedUserIds[0] !== userId
        ) {
          // ------------------------------
          // 2) SECOND PARTICIPANT (callee answers)
          // ------------------------------
          console.log('[participant_joined] 2th participant');
          const updatedAttendees = new Set(call.attendedUserIds || []);
          const updatedCurrent = new Set(call.currentUserIds || []);
          updatedAttendees.add(userId);
          updatedCurrent.add(userId);

          await this.callService.updateCall(call.id, {
            status: CallStatus.IN_PROGRESS,
            startedAt: new Date(),
            attendedUserIds: Array.from(updatedAttendees),
            currentUserIds: Array.from(updatedCurrent),
          });

          console.log(
            '[participant_joined] Call updated to IN_PROGRESS:',
            call.id,
          );

          console.log('[participant_joined] Emitting START_CALL...');
          await this.websocketCallService.emitStartCall(call.id, roomName);
          console.log(
            '[participant_joined] START_CALL emitted for call:',
            call.id,
          );
        } else {
          // ------------------------------
          // 3) THIRD+ PARTICIPANTS (group call)
          // ------------------------------
          console.log('[participant_joined] Extra participant joining...');
          const updatedAttendees = new Set(call.attendedUserIds || []);
          const updatedCurrent = new Set(call.currentUserIds || []);

          if (!updatedAttendees.has(userId)) {
            updatedAttendees.add(userId);
            updatedCurrent.add(userId);

            await this.callService.updateCall(call.id, {
              attendedUserIds: Array.from(updatedAttendees),
              currentUserIds: Array.from(updatedCurrent),
            });

            console.log(
              `[participant_joined] Extra participant ${userId} joined call ${call.id}`,
            );
          } else {
            console.log(
              `[participant_joined] Participant ${userId} already in call ${call.id}`,
            );
          }
        }

        break;
      }
      case 'participant_left': {
        const userId = payload.participant?.identity;
        const participantName = payload.participant?.name;
        if (!userId) return;

        console.log('[participant_disconnected]', participantName);

        const call = await this.callService.getActiveCallByChatId(roomName);
        if (!call) return;

        // Remove the user from current users
        await this.callService.removeCurrentUserId(roomName, userId);

        const remainingUsers =
          call.currentUserIds?.filter((id) => id !== userId) ?? [];

        if (remainingUsers.length <= 1) {
          console.log(
            '[participant_disconnected] 1 members left, END CALL',
            participantName,
          );

          // Determine call status based on whether anyone actually attended
          // If only the initiator was ever in the call (attendedUserIds.length = 1), it's a missed call
          // If more than one person attended at any point, it's a completed call
          const status =
            call.attendedUserIds?.length <= 1
              ? CallStatus.MISSED
              : CallStatus.COMPLETED;

          const endedAt = new Date();
          const updatedCall = await this.callService.updateCall(call.id, {
            status,
            endedAt,
            currentUserIds: [],
          });

          console.log(
            `[participant_left] Call ${call.id} ended. Status: ${status}, Attendees: ${call.attendedUserIds?.length}`,
          );

          await this.websocketCallService.emitEndedCall(
            call.id,
            roomName,
            status,
            userId,
          );

          const senderId = call.attendedUserIds?.[0]; // first attendee, usually the caller

          if (!senderId) {
            console.warn(
              '[participant_left] No attended users found, skipping system message',
            );
          } else {
            await this.messageService.createSystemEventMessage(
              call.chat.id,
              senderId,
              SystemEventType.CALL,
              { call: updatedCall },
            );
          }
        }

        break;
      }

      case 'track_published': {
        const userId = payload.participant?.identity;
        // const participantName = payload.participant?.name;
        // console.log('[track_published] Participant:', participantName);
        if (!userId) return;
        break;
      }

      case 'track_unpublished': {
        const userId = payload.participant?.identity;
        // const participantName = payload.participant?.name;
        // console.log('[track_unpublished] Participant:', participantName);
        if (!userId) return;
        break;
      }

      case 'room_finished': {
        console.log('[room_finished] Room:', roomName);
        await this.callService.cleanUpPendingCalls(roomName);
        break;
      }

      default:
        console.log('[Webhook] Unknown event:', payload.event);
        break;
    }
  }
}
