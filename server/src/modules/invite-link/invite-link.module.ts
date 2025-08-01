import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteLinkService } from './invite-link.service';
import { InviteLinkController } from './invite-link.controller';
import { InviteLink } from './entities/invite-link.entity';
import { Chat } from '../chat/entities/chat.entity';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { ChatMemberModule } from '../chat-member/chat-member.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InviteLink, Chat, ChatMember]),
    forwardRef(() => ChatMemberModule),
  ],
  providers: [InviteLinkService],
  controllers: [InviteLinkController],
  exports: [InviteLinkService],
})
export class InviteLinkModule {}
