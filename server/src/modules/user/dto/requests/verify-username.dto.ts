import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class VerifyUsernameDto {
  @IsString()
  @MinLength(1, { message: 'Username must be at least 1 characters long' })
  @MaxLength(24, { message: 'Username must not exceed 24 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;
}
