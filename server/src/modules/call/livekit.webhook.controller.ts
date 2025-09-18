// livekit.webhook.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { CallService } from './call.service';
import { CallStatus } from './type/callStatus';
import { ChatService } from '../chat/chat.service';

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
    private readonly chatService: ChatService,
  ) {}

  @Post()
  async handleWebhook(@Body() payload: LivekitWebhookPayload) {
    console.log('📡 LiveKit event:', payload.event);

    switch (payload.event) {
      case 'room_started':
        await this.callService.createCall({
          chatId: payload.room.name,
          status: CallStatus.DIALING,
          initiatorUserId: payload.participant?.identity || 'system',
          maxParticipants: 1,
        });
        break;

      case 'participant_connected':
        // Each time someone joins, bump maxParticipants if needed
        if (payload.room.numParticipants && payload.room.numParticipants > 1) {
          await this.callService.updateCall(payload.room.name, {
            status: CallStatus.IN_PROGRESS,
            startedAt: new Date(payload.room.creationTime ?? Date.now()),
            maxParticipants: payload.room.numParticipants, // track highest
          });
        } else {
          await this.callService.updateCall(payload.room.name, {
            maxParticipants: payload.room.numParticipants,
          });
        }
        break;

      case 'room_finished': {
        const call = await this.callService.getCallById(payload.room.name);

        if (!call) return;

        if ((call.maxParticipants ?? 1) <= 1) {
          // nobody else ever joined
          await this.callService.updateCall(payload.room.name, {
            status: CallStatus.MISSED,
            endedAt: new Date(),
          });
        } else {
          await this.callService.updateCall(payload.room.name, {
            status: CallStatus.COMPLETED,
            endedAt: new Date(),
          });
        }
        break;
      }
    }
  }
}
