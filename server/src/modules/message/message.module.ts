import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageController } from './message.controllers';
import { MessageService } from './message.service';
import { Message } from './entities/message.entity';
import { Chat } from '../chat/entities/chat.entity';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { User } from '../user/entities/user.entity';
import { MessageMapper } from './mappers/message.mapper';
import { Reaction } from './entities/reaction.entity';
import { Attachment } from '@/modules/attachment/entity/attachment.entity';
import { BlockModule } from '../block/block.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { Call } from '../call/entities/call.entity';
import { AttachmentModule } from '../attachment/attachment.module';
import { ChatMemberModule } from '../chat-member/chat-member.module';
import { LinkPreviewService } from './linkPreview.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      Attachment,
      Chat,
      ChatMember,
      User,
      Reaction,
      Call,
    ]),
    forwardRef(() => AttachmentModule),
    forwardRef(() => BlockModule),
    forwardRef(() => WebSocketModule),
    forwardRef(() => ChatMemberModule),
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageMapper, LinkPreviewService],
  exports: [MessageService, MessageMapper, TypeOrmModule, AttachmentModule],
})
export class MessageModule {}
