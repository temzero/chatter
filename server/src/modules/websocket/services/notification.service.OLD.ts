// // src/modules/notifications/notification.service.ts
// import { Injectable } from '@nestjs/common';
// import { WebsocketService } from '../websocket.service';
// import { FriendRequestResponseDto } from '../../friendship/dto/responses/friend-request-response.dto';
// import { FriendshipUpdateNotificationDto } from '../../friendship/dto/responses/friendship-update-notification.dto';
// import { NotificationEvent } from '../constants/websocket-events';

// // notification-ws.service.ts
// @Injectable()
// export class NotificationWsService {
//   constructor(private readonly websocketService: WebsocketService) {}

//   // Friend Request
//   notifyFriendRequest(receiverId: string, payload: FriendRequestResponseDto) {
//     this.websocketService.emitToUser(
//       receiverId,
//       NotificationEvent.FRIEND_REQUEST,
//       payload,
//     );
//   }

//   notifyFriendshipUpdate(
//     senderId: string | null,
//     dto: FriendshipUpdateNotificationDto,
//   ) {
//     if (!senderId) return;
//     this.websocketService.emitToUser(
//       senderId,
//       NotificationEvent.FRIENDSHIP_UPDATE,
//       dto,
//     );
//   }

//   notifyCancelFriendRequest(
//     friendshipId: string | null,
//     receiverId: string | null,
//     senderId: string | null,
//   ) {
//     if (!receiverId) return;
//     this.websocketService.emitToUser(
//       receiverId,
//       NotificationEvent.CANCEL_FRIEND_REQUEST,
//       {
//         friendshipId,
//         senderId,
//       },
//     );
//   }
// }
