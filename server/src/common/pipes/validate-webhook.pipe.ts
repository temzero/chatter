import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { LivekitWebhookPayload } from 'src/modules/call/livekit.webhook.controller';

@Injectable()
export class ValidateWebhookPipe implements PipeTransform {
  transform(value: LivekitWebhookPayload): LivekitWebhookPayload {
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
