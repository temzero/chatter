import { Exclude, Expose } from 'class-transformer';
import { AttachmentType } from 'src/modules/message/constants/attachment-type.constants';

@Exclude()
export class LastMessageResponseDto {
  @Expose()
  id: string;

  @Expose()
  senderId: string;

  @Expose()
  senderName: string;

  @Expose()
  content?: string;

  @Expose()
  attachmentType?: AttachmentType;

  @Expose()
  createdAt: Date;
}
