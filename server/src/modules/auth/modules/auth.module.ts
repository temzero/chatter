import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../../user/user.module';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { LocalStrategy } from '../strategies/local.strategy';
import { TokenService } from '../services/token.service';
import { TokenStorageService } from '../services/token-storage.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { JwtRefreshStrategy } from '../strategies/jwt-refresh.strategy';
import { VerificationCodeService } from '../services/verification-code.service';
import { MailService } from '../mail/mail.service';
import { EnvHelper } from 'src/common/helpers/env.helper';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: EnvHelper.jwt.access.secret,
      signOptions: { expiresIn: EnvHelper.jwt.access.expiration },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    TokenStorageService,
    LocalStrategy,
    JwtStrategy,
    JwtAuthGuard,
    JwtRefreshStrategy,
    JwtRefreshGuard,
    VerificationCodeService,
    MailService,
  ],
  exports: [
    AuthService,
    JwtModule,
    PassportModule,
    TokenService,
    VerificationCodeService, // Add this to exports
    MailService, // Add this if it's needed in other modules
    TokenStorageService,
  ],
})
export class AuthModule {}
