import { ChatType } from '@shared/types/enums/chat-type.enum';

export interface FolderResponse {
  id: string;
  name: string;
  color: string | null;
  types: ChatType[];
  chatIds: string[];
  position: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}
