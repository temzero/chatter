import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';
import { TokenService } from './token.service';
import { TokenStorageService } from './token-storage.service';
import { User } from '../../user/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { LoginDto } from '../dto/requests/login.dto';
import { TokenType } from '../types/token-type.enum';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/modules/user/dto/responses/user-response.dto';
import { RegisterDto } from '../dto/requests/register.dto';
import { ErrorResponse } from 'src/common/api-response/errors';
import type { JwtRefreshPayload } from '../types/jwt-payload.type';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from 'src/shared/types/enums/error-message.enum';
import { EnvHelper } from 'src/common/helpers/env.helper';

@Injectable()
export class AuthService {
  private verificationExpire: string | undefined;
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
    private readonly tokenStorageService: TokenStorageService,
  ) {
    this.verificationExpire = EnvHelper.jwt.verification.expiration;
  }

  async validateUser(loginDto: LoginDto): Promise<User | null> {
    try {
      const { identifier, password } = loginDto;
      const user = await this.userService.getUserByIdentifier(identifier);
      if (!user)
        ErrorResponse.unauthorized(UnauthorizedError.INVALID_CREDENTIALS);
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      return isPasswordValid ? user : null;
    } catch (error) {
      ErrorResponse.throw(error, 'User validation failed');
    }
  }

  async login(user: User, deviceId: string, deviceName: string) {
    try {
      const { newAccessToken, newRefreshToken } =
        await this.tokenService.generateTokenPair({
          userId: user.id,
          email: user.email,
          deviceId,
          deviceName,
        });

      await this.tokenStorageService.createRefreshToken(
        newRefreshToken,
        user.id,
        deviceId,
        deviceName,
      );

      const loginUser = await this.userService.getUserById(user.id);
      return {
        user: plainToInstance(UserResponseDto, loginUser),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      ErrorResponse.unauthorized(UnauthorizedError.ACCESS_DENIED);
    }
  }

  async register(
    registerDto: RegisterDto,
    deviceId: string,
    deviceName: string,
  ) {
    try {
      const user = await this.userService.createUser(registerDto);

      // const verifyEmailToken = this.jwtService.sign({ sub: user.id });
      // const clientUrl = this.configService.get<string>('CLIENT_URL');
      await this.mailService.sendEmailVerificationLink(user.id, user.email);

      // Automatically login the user
      return this.login(user, deviceId, deviceName);
    } catch (error) {
      ErrorResponse.throw(error, 'Registration failed');
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      // 1. Verify JWT signature and decode
      const payload = await this.tokenService.verifyToken<JwtRefreshPayload>(
        TokenType.REFRESH,
        refreshToken,
      );
      // 2. Check if token exists in database (prevent reuse)
      const storedToken =
        await this.tokenStorageService.findToken(refreshToken);
      if (!storedToken) {
        ErrorResponse.unauthorized(UnauthorizedError.INVALID_REFRESH_TOKEN);
      } else if (storedToken.expiresAt < new Date()) {
        await this.tokenStorageService.deleteToken(refreshToken);
        ErrorResponse.unauthorized(UnauthorizedError.REFRESH_TOKEN_EXPIRED);
      }
      // 3. Delete old refresh token (security best practice)
      await this.tokenStorageService.deleteDeviceTokens(
        payload.sub,
        payload.deviceId,
      );
      // 4. Generate new tokens
      const { newAccessToken, newRefreshToken } =
        await this.tokenService.generateTokenPair({
          userId: payload.sub,
          email: payload.email,
          deviceId: payload.deviceId,
          deviceName: payload.deviceName,
        });
      // 5. Save new refresh token
      await this.tokenStorageService.createRefreshToken(
        newRefreshToken,
        payload.sub,
        payload.deviceId,
        payload.deviceName,
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        email: payload.email,
        deviceName: payload.deviceName,
      };
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to refresh tokens');
    }
  }

  async sendPasswordResetEmail(email: string): Promise<{ message: string }> {
    try {
      const user = await this.userService.getUserByIdentifier(email);
      if (!user) {
        ErrorResponse.badRequest(BadRequestError.PASSWORD_RESET_SENT);
      }
      // Generate time-limited token with specific purpose
      const resetPasswordToken = this.jwtService.sign(
        {
          sub: user.id,
          purpose: 'password_reset',
          email: user.email, // Include email to prevent token reuse if email changes
        },
        { expiresIn: this.verificationExpire },
      );

      const clientUrl = EnvHelper.clientUrl;
      const resetUrl = `${clientUrl}/auth/reset-password?token=${encodeURIComponent(resetPasswordToken)}`;

      await this.mailService.sendPasswordResetEmail(user.email, resetUrl);

      return { message: 'Password reset link sent if account exists' };
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to process password reset request');
    }
  }

  async setNewPasswordWithToken(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    try {
      // Verify and decode the token with additional security checks
      const payload = this.jwtService.verify<{
        sub: string;
        purpose: string;
        email: string;
        timestamp: number;
      }>(token);
      // Validate token purpose
      if (payload.purpose !== 'password_reset') {
        ErrorResponse.badRequest(BadRequestError.INVALID_TOKEN_PURPOSE);
      }
      // Get user and validate email match
      const user = await this.userService.getUserById(payload.sub);
      if (!user) {
        ErrorResponse.notFound(NotFoundError.USER_NOT_FOUND);
      }
      // Verify the email in token matches user's current email
      if (user.email !== payload.email) {
        ErrorResponse.forbidden(ForbiddenError.EMAIL_MISMATCH);
      }
      // Update password and record change time
      await this.userService.updatePassword(payload.sub, newPassword);

      return { message: 'Password reset successfully' };
    } catch (error) {
      ErrorResponse.throw(
        error,
        'Password reset failed - please request a new link',
      );
    }
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    let userId: string;
    try {
      const payload = this.jwtService.verify<{
        sub: string;
        purpose?: string;
        email?: string;
      }>(token);

      if (payload.purpose !== 'email_verification') {
        ErrorResponse.badRequest(BadRequestError.INVALID_TOKEN_PURPOSE);
      }

      userId = payload.sub;
      const user = await this.userService.getUserById(userId);

      // Additional validation
      if (user.emailVerified) {
        return { message: 'Email already verified' };
      }

      if (payload.email && user.email !== payload.email) {
        ErrorResponse.forbidden(ForbiddenError.EMAIL_MISMATCH);
      }

      // Update with transaction
      await this.userService.updateUser(userId, {
        emailVerified: true,
      });

      return { message: 'Email verified successfully' };
    } catch (error) {
      ErrorResponse.throw(error, 'Email verification failed');
    }
  }

  async logout(userId: string, deviceId: string): Promise<void> {
    try {
      await this.tokenStorageService.deleteDeviceTokens(userId, deviceId);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to logout');
    }
  }

  async logoutAll(userId: string): Promise<void> {
    try {
      await this.tokenStorageService.deleteAllUserTokens(userId);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to logout from all devices');
    }
  }
}
