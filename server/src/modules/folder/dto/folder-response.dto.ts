import { ChatType } from 'src/shared/types/enums/chat-type.enum';
import { Exclude, Expose, Type } from 'class-transformer';
import { FolderResponse } from 'src/shared/types/responses/folder.response';

@Exclude()
export class FolderResponseDto implements FolderResponse {
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
  createdAt: Date | string;

  @Expose()
  updatedAt: Date | string;
}
