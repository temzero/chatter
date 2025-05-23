import { Exclude, Expose } from 'class-transformer';
import { AttachmentType } from 'src/modules/message/constants/attachment-type.constants';

@Exclude()
export class LastMessageResponseDto {
  @Expose()
  senderName: string;

  @Expose()
  content?: string;

  @Expose()
  attachmentTypes?: AttachmentType;

  @Expose()
  createdAt: Date;
}
