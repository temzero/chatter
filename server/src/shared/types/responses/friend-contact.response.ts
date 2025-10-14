export interface FriendContactResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  username?: string;
  phoneNumber?: string;
}
