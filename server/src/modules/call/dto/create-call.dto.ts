export class CreateCallDto {
  chatId: string;
  isVideoCall: boolean;
  isGroupCall: boolean;
  initiatorId: string;
  roomName: string;
}
