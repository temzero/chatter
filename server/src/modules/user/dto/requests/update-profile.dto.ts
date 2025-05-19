import {
  IsOptional,
  IsString,
  Length,
  IsPhoneNumber,
  Matches,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @Length(3, 100)
  @Matches(/^[a-z0-9_.-]+$/)
  username?: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @Length(0, 512)
  avatarUrl?: string;
}
