import { UserOnlineEvent } from './userOnlineEvent.type';
import { NewMessageEvent } from './newMessageEvent.type';
import { CreateMessageDto } from 'src/modules/message/dto/requests/create-message.dto';

export interface ServerToClientEvents {
  userOnline: (payload: UserOnlineEvent) => void;
  newMessage: (message: NewMessageEvent) => void;
}

export interface ClientToServerEvents {
  sendMessage: (payload: CreateMessageDto) => void;
  joinRoom: (roomId: string) => void;
}
