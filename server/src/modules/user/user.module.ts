import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controllers';
import { UserService } from './user.service';
import { User } from 'src/modules/user/entities/user.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { SupabaseModule } from '../superbase/supabase.module';
import { FriendshipModule } from '../friendship/friendship.module';
import { AuthModule } from '../auth/modules/auth.module';
import { VerificationCode } from '../auth/entities/verification_code.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, VerificationCode]),
    forwardRef(() => FriendshipModule),
    SupabaseModule,
    forwardRef(() => AuthModule), // Use forwardRef here
  ],
  controllers: [UserController],
  providers: [UserService], // Removed MailService and TokenStorageService as they come from AuthModule
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
