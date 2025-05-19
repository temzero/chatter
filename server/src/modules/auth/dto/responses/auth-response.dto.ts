import { Expose } from 'class-transformer';
import { UserResponseDto } from 'src/modules/user/dto/responses/user-response.dto';

export class AuthResponseDto {
  @Expose()
  user: UserResponseDto;

  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  expiresIn: number;
}
