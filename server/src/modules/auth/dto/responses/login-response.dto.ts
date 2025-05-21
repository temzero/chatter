import { Expose } from 'class-transformer';
import { UserResponseDto } from 'src/modules/user/dto/responses/user-response.dto';

export class LoginResponseDto {
  @Expose()
  user: UserResponseDto;

  @Expose()
  accessToken: string;
}
