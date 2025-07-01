import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './message.controllers';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { Chat } from '../chat/entities/chat.entity';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { User } from '../user/entities/user.entity';
import { MessageMapper } from './mappers/message.mapper';
import { Reaction } from './entities/reaction.entity';
import { Attachment } from './entities/attachment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      Attachment,
      Chat,
      ChatMember,
      User,
      Reaction,
    ]),
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageMapper],
  exports: [MessageService, MessageMapper, TypeOrmModule],
})
export class MessageModule {}
