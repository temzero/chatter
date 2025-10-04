import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { ChatMemberModule } from '../chat-member/chat-member.module';
import { ChatMember } from '../chat-member/entities/chat-member.entity';
import { User } from '../user/entities/user.entity';
import { FriendshipModule } from '../friendship/friendship.module';
import { WebSocketModule } from '../websocket/websocket.module';
import { MessageModule } from '../message/message.module';
import { ChatMapper } from './mappers/chat.mapper';
import { BlockModule } from '../block/block.module';
import { InviteLinkModule } from '../invite-link/invite-link.module';
import { DirectChatMapper } from './mappers/direct-chat.mapper';
import { PublicChatMapper } from './mappers/public-chat.mapper';
import { GroupChatMapper } from './mappers/group-chat.mapper';
import { MessageMapper } from '../message/mappers/message.mapper';
import { ChatMemberService } from '../chat-member/chat-member.service';
import { MessageService } from '../message/message.service';
import { SupabaseModule } from '../superbase/supabase.module';
import { SavedChatMapper } from './mappers/saved-chat.mapper';

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, ChatMember, User]),
    forwardRef(() => ChatMemberModule),
    forwardRef(() => MessageModule),
    forwardRef(() => FriendshipModule),
    forwardRef(() => BlockModule),
    forwardRef(() => WebSocketModule),
    forwardRef(() => InviteLinkModule),
    forwardRef(() => SupabaseModule),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatMapper,
    DirectChatMapper,
    GroupChatMapper,
    PublicChatMapper,
    SavedChatMapper,
    MessageMapper,
    ChatMemberService,
    MessageService,
  ],
  exports: [ChatService, ChatMapper, TypeOrmModule],
})
export class ChatModule {}
