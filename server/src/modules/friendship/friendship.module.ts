import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipController } from './friendship.controller';
import { FriendshipService } from './friendship.service';
import { Friendship } from './entities/friendship.entity';
import { UserModule } from '../user/user.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friendship]),
    forwardRef(() => UserModule),
    forwardRef(() => WebSocketModule),
  ],
  controllers: [FriendshipController],
  providers: [FriendshipService],
  exports: [FriendshipService, TypeOrmModule],
})
export class FriendshipModule {}
