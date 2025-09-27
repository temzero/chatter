import { Controller, Post, Body } from '@nestjs/common';
import { CallService } from './call.service';
import { CallStatus } from './type/callStatus';
import { MessageService } from '../message/message.service';
import { SystemEventType } from '../message/constants/system-event-type.constants';
import { WebsocketCallService } from '../websocket/services/websocket-call.service';
import { ValidateWebhookPipe } from 'src/common/pipes/validate-webhook.pipe';
import { ChatType } from '../chat/constants/chat-types.constants';
import { LiveKitService } from './liveKit.service';
import { LiveKitWebhookPayload } from '../websocket/constants/LiveKitWebhookPayload.type';
import { UserService } from '../user/user.service';

@Controller('liveKit/webhook')
export class LiveKitWebhookController {
  constructor(
    private readonly liveKitService: LiveKitService,
    private readonly callService: CallService,
    private readonly messageService: MessageService,
    private readonly websocketCallService: WebsocketCallService,
    private readonly userService: UserService,
  ) {}

  @Post()
  async handleWebhook(
    @Body(ValidateWebhookPipe) payload: LiveKitWebhookPayload,
  ) {
    const roomName = payload.room?.name;
    if (!roomName) {
      console.warn('[Webhook] No room info in payload:', payload);
      return;
    }

    switch (payload.event) {
      case 'room_started':
        console.log('[room_started] Room:', roomName);
        break;

      case 'participant_joined':
        await this.handleParticipantJoined(
          roomName,
          payload.participant?.identity,
        );
        break;

      case 'participant_left':
        await this.handleParticipantLeft(
          roomName,
          payload.participant?.identity,
        );
        break;

      case 'track_published':
        break;

      case 'track_unpublished':
        break;

      case 'room_finished':
        await this.handleRoomFinished(roomName);
        break;

      default:
        console.log('[Webhook] Unknown event:', payload.event);
        break;
    }
  }

  // ----------------------
  // Private event handlers
  // ----------------------
  private async handleParticipantJoined(roomName: string, userId?: string) {
    if (!userId) {
      console.log('[participant_joined] No participant identity found');
      return;
    }

    let call = await this.callService.getActiveCallByChatId(roomName);
    console.log('[participant_joined] Existing call:', call ? call.id : 'None');

    const user = await this.userService.getUserById(userId); // fetch User entity
    if (!user) {
      console.log('[participant_joined] User not found');
      return;
    }

    if (!call) {
      call = await this.callService.createCall({
        chatId: roomName,
        status: CallStatus.DIALING,
        initiatorUser: user,
      });

      const isVideoCall = call.chat?.type === ChatType.GROUP;
      await this.websocketCallService.emitIncomingCall(
        call.id,
        roomName,
        userId,
        isVideoCall,
      );
    } else {
      const existingAttendees = new Set(call.attendedUsers.map((u) => u.id));
      const isNewUser = !existingAttendees.has(userId);

      if (isNewUser) {
        call.attendedUsers.push(user);

        if (call.attendedUsers.length === 2) {
          // first other participant joined
          call.status = CallStatus.IN_PROGRESS;
          call.startedAt = new Date();
        }

        if (!call.currentUserIds.includes(userId)) {
          call.currentUserIds.push(userId);
        }

        await this.callService.saveCall(call);

        if (call.status === CallStatus.IN_PROGRESS) {
          await this.websocketCallService.emitStartCall(
            call.id,
            roomName,
            call.currentUserIds[0],
          );
        }
      } else {
        console.log(
          `[participant_joined] Participant ${userId} already in call ${call.id}`,
        );
      }
    }
  }

  private async handleParticipantLeft(roomName: string, userId?: string) {
    if (!userId) return;

    const call = await this.callService.getActiveCallByChatId(roomName);
    if (!call) return;

    // remove the user from the "currently in room" list
    await this.callService.removeCurrentUserId(roomName, userId);

    const remainingUsers =
      call.currentUserIds?.filter((id) => id !== userId) ?? [];

    if (remainingUsers.length <= 1) {
      const attendeeCount = call.attendedUsers?.length ?? 0;
      const status =
        attendeeCount <= 1 ? CallStatus.MISSED : CallStatus.COMPLETED;

      const endedAt = new Date();
      const updatedCall = await this.callService.updateCall(call.id, {
        status,
        endedAt,
        currentUserIds: [],
      });

      await this.websocketCallService.emitEndedCall(
        call.id,
        roomName,
        status,
        userId,
      );

      // ✅ pick a sender from attendedUsers[0] if available
      const sender = call.attendedUsers?.[0];
      if (sender) {
        await this.messageService.createSystemEventMessage(
          call.chat.id,
          sender.id,
          SystemEventType.CALL,
          { call: updatedCall },
        );
      } else {
        console.warn('[participant_left] No attended users found');
      }

      await this.liveKitService.deleteRoom(roomName);
    }
  }

  private async handleRoomFinished(roomName: string) {
    console.log('[room_finished] Room:', roomName);
    await this.callService.cleanUpPendingCalls(roomName);
  }
}
