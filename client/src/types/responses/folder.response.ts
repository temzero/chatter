import { ChatType } from "../enums/ChatType";
import { ChatResponse } from "./chat.response";

export interface FolderResponse {
  id: string;
  name: string;
  color: string | null;
  types: ChatType[];
  chats: ChatResponse[]; // Full chat objects (or change to chatIds if you're only returning IDs)
  createdAt: string;
  updatedAt: string;
}
