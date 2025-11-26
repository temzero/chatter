// src/modules/attachment/attachment.module.ts
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from './entity/attachment.entity';
import { AttachmentService } from './attachment.service';
import { AttachmentsController } from './attachment.controller';
import { Message } from '../message/entities/message.entity';
import { SupabaseModule } from '../superbase/supabase.module';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attachment, Message]),
    forwardRef(() => MessageModule),
    forwardRef(() => SupabaseModule),
  ],
  controllers: [AttachmentsController],
  providers: [AttachmentService],
  exports: [AttachmentService],
})
export class AttachmentModule {}
