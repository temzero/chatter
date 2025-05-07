import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controllers';
import { ChatService } from './chat.service';
import { Chat } from './entities/chat.entity';
import { ChatGroupModule } from '../chat-group/chat-group.module'; // Add this import

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat]),
    ChatGroupModule, // Add this line to import the module
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
