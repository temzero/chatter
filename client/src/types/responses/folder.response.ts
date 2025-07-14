import { ChatType } from "../enums/ChatType";

export interface FolderResponse {
  id: string;
  name: string;
  color: string | null;
  types: ChatType[];
  chatIds: string[];
  position: number;
  createdAt: string;
  updatedAt: string;
}
