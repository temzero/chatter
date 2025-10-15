import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';
import { ConfigService } from '@nestjs/config';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly tokenService: TokenService,
    private readonly tokenStorageService: TokenStorageService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<User | null> {
    try {
      const { identifier, password } = loginDto;
      const user = await this.userService.getUserByIdentifier(identifier);
      if (!user) ErrorResponse.unauthorized('Invalid credentials');
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
    } catch (error) {
      ErrorResponse.throw(error, 'Login failed');
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
        ErrorResponse.unauthorized('Refresh token not found');
      } else if (storedToken.expiresAt < new Date()) {
        await this.tokenStorageService.deleteToken(refreshToken);
        ErrorResponse.unauthorized('Refresh token expired');
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
        ErrorResponse.badRequest(
          'If an account exists, a password reset link has been sent',
        );
      }
      // Generate time-limited token with specific purpose
      const resetPasswordToken = this.jwtService.sign(
        {
          sub: user.id,
          purpose: 'password_reset',
          email: user.email, // Include email to prevent token reuse if email changes
        },
        { expiresIn: '15m' }, // Short-lived token for security
      );

      const clientUrl = this.configService.get<string>('CLIENT_URL');
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
        ErrorResponse.unauthorized('Invalid token type');
      }
      // Get user and validate email match
      const user = await this.userService.getUserById(payload.sub);
      if (!user) {
        ErrorResponse.notFound('User not found');
      }
      // Verify the email in token matches user's current email
      if (user.email !== payload.email) {
        ErrorResponse.unauthorized('Email mismatch - token invalid');
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
        ErrorResponse.unauthorized('Invalid token purpose');
      }

      userId = payload.sub;
      const user = await this.userService.getUserById(userId);

      // Additional validation
      if (user.emailVerified) {
        return { message: 'Email already verified' };
      }

      if (payload.email && user.email !== payload.email) {
        ErrorResponse.unauthorized('Email mismatch');
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
