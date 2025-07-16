// src/modules/block/block.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';
import { Block } from './entity/block.entity';
import { User } from '../user/entities/user.entity';
import { FriendshipModule } from '../friendship/friendship.module';

@Module({
  imports: [TypeOrmModule.forFeature([Block, User]), FriendshipModule],
  controllers: [BlockController],
  providers: [BlockService],
  exports: [BlockService],
})
export class BlockModule {}
