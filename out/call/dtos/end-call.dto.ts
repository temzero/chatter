import { IsNumber, IsOptional } from 'class-validator';

export class EndCallDto {
  @IsNumber()
  @IsOptional()
  duration?: number;
}
