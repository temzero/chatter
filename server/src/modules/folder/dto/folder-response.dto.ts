import { ChatType } from 'src/modules/chat/constants/chat-types.constants';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class FolderResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  color: string | null;

  @Expose()
  types: ChatType[];

  @Expose()
  @Type(() => String)
  chatIds: string[];

  @Expose()
  position: number;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
