import { ChatType } from "@/shared/types/enums/chat-type.enum";

export default interface FolderResponse {
  id: string;
  name: string;
  color: string | null;
  types: ChatType[];
  chatIds: string[];
  position: number;
  createdAt: string;
  updatedAt: string;
}
