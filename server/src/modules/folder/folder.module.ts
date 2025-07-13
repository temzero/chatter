import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Folder } from './entities/folder.entity';

import { FolderService } from './folder.service';
import { FolderController } from './folder.controllers';
import { Chat } from '../chat/entities/chat.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Folder, Chat, User])],
  controllers: [FolderController],
  providers: [FolderService],
})
export class FolderModule {}
