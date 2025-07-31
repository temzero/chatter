// src/modules/friendship/dto/friend-contact-response.dto.ts
import { Expose } from 'class-transformer';

export class ContactResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  avatarUrl?: string | null;

  @Expose()
  username?: string;

  @Expose()
  phoneNumber?: string;
}
