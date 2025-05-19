import {
  IsString,
  IsBoolean,
  IsArray,
  ArrayNotEmpty,
  IsUUID,
  IsOptional,
  IsIn,
} from 'class-validator';

export class ChatGroupDto {
  @IsString()
  name: string;

  @IsString()
  @IsIn(['group', 'channel'])
  type: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @IsOptional()
  avatar: string;

  @IsBoolean()
  @IsOptional()
  is_public: boolean = false; // Default to false

  @IsBoolean()
  @IsOptional()
  is_broadcast_only: boolean = true; // Default to true

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  memberIds: string[];
}
