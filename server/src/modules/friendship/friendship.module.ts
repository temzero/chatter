import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipController } from './friendship.controller';
import { FriendshipService } from './friendship.service';
import { Friendship } from './entities/friendship.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friendship]),
    forwardRef(() => UserModule),
  ],
  controllers: [FriendshipController],
  providers: [FriendshipService],
  exports: [FriendshipService, TypeOrmModule],
})
export class FriendshipModule {}
