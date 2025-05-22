import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
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

      const loginUser = await this.userService.setUserOnlineStatus(
        user.id,
        true,
      );
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

      const verifyEmailToken = this.jwtService.sign({ sub: user.id });
      const clientUrl = this.configService.get<string>('CLIENT_URL');
      const verificationUrl = `${clientUrl}/auth/verify-email/${user.firstName}/${user.email}/${verifyEmailToken}`;
      await this.mailService.sendVerificationEmail(user.email, verificationUrl);

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

  async sendPasswordResetEmail(email: string) {
    try {
      const user = await this.userService.getUserByIdentifier(email);
      if (!user) return { message: 'user Not found' };
      if (user.emailVerified === false) {
        ErrorResponse.unauthorized('Email not verified');
      }
      const resetPasswordToken = this.jwtService.sign({ sub: user.id });
      const clientUrl = this.configService.get<string>('CLIENT_URL');
      const resetUrl = `${clientUrl}/auth/reset-password/${resetPasswordToken}`;

      await this.mailService.sendPasswordResetEmail(email, resetUrl);
      return { message: 'Verification email sent successfully.' };
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to send password reset email');
    }
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      await this.userService.updateUser(payload.sub, {
        emailVerified: true,
      });
      return { message: 'Email verified successfully.' };
    } catch (error) {
      console.error('verifyEmail', error);
      ErrorResponse.unauthorized('Invalid or expired token');
    }
  }

  async setNewPasswordWithToken(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      await this.userService.updatePassword(payload.sub, newPassword);
      return { message: 'Password reset successfully.' };
    } catch (error) {
      console.error('setNewPasswordWithToken', error);
      ErrorResponse.unauthorized('Invalid or expired token');
    }
  }

  async logout(userId: string, deviceId: string): Promise<void> {
    try {
      await this.tokenStorageService.deleteDeviceTokens(userId, deviceId);
      // Update user status
      await this.userService.setUserOnlineStatus(userId, false);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to logout');
    }
  }

  async logoutAll(userId: string): Promise<void> {
    try {
      await this.tokenStorageService.deleteAllUserTokens(userId);
      // Update user status
      await this.userService.setUserOnlineStatus(userId, false);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to logout from all devices');
    }
  }
}
