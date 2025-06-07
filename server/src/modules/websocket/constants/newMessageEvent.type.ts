import { MessageService } from 'src/modules/message/message.service';

export type NewMessageEvent =
  ReturnType<MessageService['createMessage']> extends Promise<infer T>
    ? T
    : never;
