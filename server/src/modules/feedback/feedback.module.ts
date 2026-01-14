// feedback.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feedback } from './entities/feedback.entity';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { UserModule } from '@/modules/user/user.module';
import { MailModule } from '../auth/mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Feedback]), UserModule, MailModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService, TypeOrmModule],
})
export class FeedbackModule {}
