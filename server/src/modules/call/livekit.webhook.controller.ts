import { Controller, Post, Body } from '@nestjs/common';
import { CallService } from './call.service';
import { CallStatus } from '@shared/types/call';
import { MessageService } from '../message/message.service';
import { WebsocketCallService } from '../websocket/services/websocket-call.service';
import { ValidateWebhookPipe } from '@/common/pipes/validate-webhook.pipe';
import { ChatType } from '@shared/types/enums/chat-type.enum';
import { LiveKitService } from './liveKit.service';
import { LiveKitWebhookPayload } from '../websocket/constants/LiveKitWebhookPayload.type';
import { UserService } from '../user/user.service';
import { ChatService } from '../chat/chat.service';
import { ChatMemberService } from '../chat-member/chat-member.service';
import { Call } from './entities/call.entity';
import { Chat } from '../chat/entities/chat.entity';
import { User } from '../user/entities/user.entity';
import { ChatEvent } from '@shared/types/enums/websocket-events.enum';
import { MessageMapper } from '../message/mappers/message.mapper';
import { WebsocketNotificationService } from '../websocket/services/websocket-notification.service';

@Controller('liveKit/webhook')
export class LiveKitWebhookController {
  constructor(
    private readonly liveKitService: LiveKitService,
    private readonly callService: CallService,
    private readonly messageService: MessageService,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
    private readonly chatMemberService: ChatMemberService,
    private readonly messageMapper: MessageMapper,
    private readonly websocketCallService: WebsocketCallService,
    private readonly websocketNotificationService: WebsocketNotificationService,
  ) {}

  @Post()
  async handleWebhook(
    @Body(ValidateWebhookPipe) payload: LiveKitWebhookPayload,
  ) {
    const chatId = payload.room?.name; // LiveKit chatId is chatId
    if (!chatId) {
      console.warn('[Webhook] No room info in payload:', payload);
      return;
    }

    switch (payload.event) {
      case 'room_started':
        console.log('[room_started] Room:', chatId);
        break;

      case 'participant_joined':
        await this.handleParticipantJoined(
          chatId,
          payload.participant?.identity,
        );
        break;

      case 'participant_left':
        await this.handleParticipantLeft(chatId, payload.participant?.identity);
        break;

      case 'track_published':
      case 'track_unpublished':
        break;

      case 'room_finished':
        await this.handleRoomFinished(chatId);
        break;

      default:
        console.log('[Webhook] Unknown event:', payload.event);
        break;
    }
  }

  // ----------------------
  // Participant Joined
  // ----------------------
  private async handleParticipantJoined(chatId: string, userId?: string) {
    if (!userId) {
      console.log('[participant_joined] No participant identity found');
      return;
    }

    const call = await this.callService.getActiveCallByChatId(chatId);
    const chat = call?.chat ?? (await this.chatService.getChatById(chatId));
    const isBroadcast = chat.type === ChatType.CHANNEL;
    const user = await this.userService.getUserById(userId);

    if (!user) return;

    // Common logic: Handle call creation and participant addition
    if (!call) {
      await this.handleNewCall(chatId, user, chat, isBroadcast);
    } else {
      await this.handleExistingCall(call, user, chatId, isBroadcast);
    }
  }

  private async handleNewCall(
    chatId: string,
    user: User,
    chat: Chat,
    isBroadcast: boolean,
  ) {
    const call = await this.callService.createCall({
      chatId: chatId,
      status: isBroadcast ? CallStatus.IN_PROGRESS : CallStatus.DIALING,
      initiatorUser: user,
      ...(isBroadcast && { startedAt: new Date() }),
    });

    // Always emit incoming call first
    await this.websocketCallService.emitIncomingCall(
      call.id,
      chatId,
      user.id,
      chat.type === ChatType.GROUP,
      isBroadcast,
    );

    // Start call immediately for broadcast, otherwise wait for participants
    if (isBroadcast) {
      await this.websocketCallService.emitStartCall(call.id, chatId, user.id);
    }
  }

  private async handleExistingCall(
    call: Call,
    user: User,
    chatId: string,
    isBroadcast: boolean,
  ) {
    const existingUserIds = new Set(call.currentUserIds);

    // Common logic: Add participant if not already in call
    if (!existingUserIds.has(user.id)) {
      call.attendedUsers.push(user);
      call.currentUserIds.push(user.id);

      if (isBroadcast) {
        // For broadcast, just save the call with new participant
        await this.callService.saveCall(call);
      } else {
        // For normal calls, start when second participant joins
        if (call.attendedUsers.length === 2) {
          call.status = CallStatus.IN_PROGRESS;
          call.startedAt = new Date();

          await this.websocketCallService.emitStartCall(
            call.id,
            chatId,
            call.currentUserIds[0],
          );
        }
        await this.callService.saveCall(call);
      }
    } else {
      console.log(
        `[participant_joined] Participant ${user.id} already in call ${call.id}`,
      );
    }
  }

  // ----------------------
  // Participant Left
  // ----------------------
  private async handleParticipantLeft(chatId: string, userId?: string) {
    if (!userId) return;

    const call = await this.callService.getActiveCallByChatId(chatId);
    if (!call) return;

    const chat = call.chat ?? (await this.chatService.getChatById(chatId));
    const isBroadcast = chat.type === ChatType.CHANNEL;

    // Remove user from current participants
    await this.callService.removeCurrentUserId(chatId, userId);

    if (isBroadcast) {
      await this.handleBroadcastParticipantLeft(call, userId, chatId);
    } else {
      await this.handleNormalCallParticipantLeft(call, userId, chatId);
    }
  }

  private async handleBroadcastParticipantLeft(
    call: Call,
    userId: string,
    chatId: string,
  ) {
    // End broadcast only if initiator leaves
    if (call.attendedUsers[0]?.id === userId) {
      await this.endCall(call, chatId, CallStatus.COMPLETED, userId);
    }
  }

  private async handleNormalCallParticipantLeft(
    call: Call,
    userId: string,
    chatId: string,
  ) {
    const remainingUsers =
      call.currentUserIds?.filter((id) => id !== userId) ?? [];

    // End call if 1 or fewer participants remain
    if (remainingUsers.length <= 1) {
      const attendeeCount = call.attendedUsers?.length ?? 0;
      const status =
        attendeeCount <= 1 ? CallStatus.MISSED : CallStatus.COMPLETED;

      await this.endCall(call, chatId, status, userId);
    }
  }

  private async endCall(
    call: Call,
    chatId: string,
    status: CallStatus,
    userId: string,
  ) {
    const endedAt = new Date();

    // 🟢 Update call record
    const updatedCall = await this.callService.updateCall(call.id, {
      status,
      endedAt,
      currentUserIds: [],
    });

    // 🟢 Notify all participants that the call ended
    await this.websocketCallService.emitEndedCall(
      call.id,
      chatId,
      status,
      userId,
    );

    // 🟢 Create and emit a normal message (not a system event)
    const sender = call.attendedUsers?.[0];
    if (sender) {
      const message = await this.messageService.createMessage(sender.id, {
        chatId: call.chat.id,
        call: updatedCall,
      });

      const senderMember =
        await this.chatMemberService.getMemberByChatIdAndUserId(
          chatId,
          sender.id,
        );

      const messageResponse = this.messageMapper.mapMessageToMessageResDto(
        message,
        senderMember.nickname || undefined,
      );

      await this.websocketNotificationService.emitToChatMembers(
        chatId,
        ChatEvent.NEW_MESSAGE,
        messageResponse,
      );
    }

    // 🟢 Clean up LiveKit room
    await this.liveKitService.deleteRoom(chatId);
  }

  // ----------------------
  // Room Finished
  // ----------------------
  private async handleRoomFinished(chatId: string) {
    console.log('[room_finished] Room:', chatId);
    await this.callService.cleanUpPendingCalls(chatId);
  }
}
