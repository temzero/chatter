import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenController } from './refresh-token.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshToken])],
  providers: [RefreshTokenService],
  controllers: [RefreshTokenController], // Optional, only if you have an API endpoint for refresh tokens
  exports: [RefreshTokenService], // Export if other modules need to use the service
})
export class RefreshTokenModule {}
