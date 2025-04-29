/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { MediaDto } from './media.dto';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'senderId should not be empty' })
  senderId: string;

  @IsString()
  @IsNotEmpty({ message: 'conversationId should not be empty' })
  conversationId: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @Type(() => MediaDto)
  media?: MediaDto;

  @IsOptional()
  @IsString()
  replyToMessageId?: string;
}
