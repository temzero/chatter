// mail.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { AuthModule } from '../modules/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/modules/user/entities/user.entity';

@Module({
  imports: [
    // Add TypeOrmModule with User entity
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
