// create-feedback-base.dto.ts
import { IsOptional, IsString } from 'class-validator';

export class DeviceInfoDto {
  @IsOptional()
  @IsString()
  deviceModel?: string;

  @IsOptional()
  @IsString()
  browser?: string;

  @IsOptional()
  @IsString()
  browserVersion?: string;

  @IsOptional()
  @IsString()
  screenResolution?: string;

  @IsOptional()
  @IsString()
  language?: string;
}
