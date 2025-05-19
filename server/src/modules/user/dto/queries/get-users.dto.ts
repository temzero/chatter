import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { UserRole } from '../../constants/user-role.constants';
import { UserStatus } from '../../constants/user-status.constants';

export class GetUsersDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsNumber()
  @Min(0)
  offset = 0;
}
