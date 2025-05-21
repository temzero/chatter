import { Expose } from 'class-transformer';
import { UserResponseDto } from 'src/modules/user/dto/responses/user-response.dto';

/**
 * Token response structure returned after successful authentication.
 */
export class TokenResponseDto {
  /**
   * Authenticated user information.
   */
  @Expose()
  user: UserResponseDto;

  /**
   * JWT access token used for authenticating requests.
   */
  @Expose()
  accessToken: string;

  /**
   * JWT refresh token used to obtain new access tokens.
   */
  @Expose()
  refreshToken: string;

  /**
   * Time in seconds until the access token expires.
   */
  @Expose()
  expiresIn: number;
}
