import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsDate,
  IsArray,
  IsIn,
  IsBoolean,
} from 'class-validator';
import { UserRole } from '../../constants/user-role.constants';
import { UserStatus } from '../../constants/user-status.constants';

export class SearchUsersDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }): string | undefined =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  query?: string;

  @IsOptional()
  @IsArray()
  @IsIn(Object.values(UserRole), { each: true })
  @Transform(({ value }): UserRole[] =>
    typeof value === 'string' ? [value as UserRole] : (value as UserRole[]),
  )
  roles?: UserRole[];

  @IsOptional()
  @IsArray()
  @IsIn(Object.values(UserStatus), { each: true })
  @Transform(({ value }): UserStatus[] =>
    typeof value === 'string' ? [value as UserStatus] : (value as UserStatus[]),
  )
  statuses?: UserStatus[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastActiveAfter?: Date;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  hasVerifiedEmail?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['firstName', 'lastName', 'createdAt', 'lastActiveAt'])
  sortBy?: string = 'createdAt';

  @IsOptional()
  @Transform(({ value }) => (value === 'asc' ? 'asc' : 'desc'))
  sortOrder?: 'asc' | 'desc' = 'desc';
}
