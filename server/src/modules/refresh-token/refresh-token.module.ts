import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshTokenController } from './refresh-token.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    forwardRef(() => AuthModule),
    UserModule,
    JwtModule,
    ConfigModule,
  ],
  providers: [RefreshTokenService],
  controllers: [RefreshTokenController], // Optional, only if you have an API endpoint for refresh tokens
  exports: [RefreshTokenService], // Export if other modules need to use the service
})
export class RefreshTokenModule {}
