import { Module } from '@nestjs/common';
import { MessageController } from './message.controllers';
import { MessageService } from './message.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
