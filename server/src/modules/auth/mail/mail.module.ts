// mail.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { AuthModule } from '../modules/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)], // Import the module that provides VerificationCodeService
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
