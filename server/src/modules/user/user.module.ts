import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controllers';
import { UserService } from './user.service';
import { User } from 'src/modules/user/entities/user.entity';
import { TokenStorageService } from '../auth/services/token-storage.service';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { SupabaseModule } from '../superbase/supabase.module';
import { FriendshipModule } from '../friendship/friendship.module';
import { MailModule } from '../auth/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]),
    forwardRef(() => FriendshipModule),
    MailModule,
    SupabaseModule,
  ],
  controllers: [UserController],
  providers: [UserService, TokenStorageService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
