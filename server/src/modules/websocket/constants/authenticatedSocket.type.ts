import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: string;
      [key: string]: any; // Allow other user properties
    };
  };
}
