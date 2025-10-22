// bootstrap.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BootstrapService } from './bootstrap.service';
import { BootstrapController } from './bootstrap.controller';
import { AuthModule } from '../auth/modules/auth.module';
import { ChatModule } from '../chat/chat.module';
import { MessageModule } from '../message/message.module';
import { FolderModule } from '../folder/folder.module';
import { FriendshipModule } from '../friendship/friendship.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    AuthModule,
    ChatModule,
    MessageModule,
    FolderModule,
    FriendshipModule,
  ],
  controllers: [BootstrapController],
  providers: [BootstrapService],
  exports: [BootstrapService],
})
export class BootstrapModule {}
