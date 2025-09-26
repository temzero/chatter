import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { LiveKitWebhookPayload } from 'src/modules/call/livekit.webhook.controller';

@Injectable()
export class ValidateWebhookPipe implements PipeTransform {
  transform(value: LiveKitWebhookPayload): LiveKitWebhookPayload {
    if (!value || typeof value !== 'object') {
      throw new BadRequestException('Invalid payload');
    }
    if (!value.event) {
      throw new BadRequestException('Missing event');
    }
    if (!value.room?.name) {
      throw new BadRequestException('Missing room info');
    }
    return value;
  }
}
