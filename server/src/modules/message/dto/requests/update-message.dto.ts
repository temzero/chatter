import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMessageDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;
}
