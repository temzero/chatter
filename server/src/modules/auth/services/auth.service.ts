import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/user.service';
import { ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';
import { TokenStorageService } from './token-storage.service';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { User } from '../../user/entities/user.entity';
import { MailService } from '../../mail/mail.service';
import { LoginDto } from '../dto/login.dto';
import { TokenType } from '../types/token-type.enum';
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
    const { identifier, password } = loginDto;
    const user = await this.userService.getUserByIdentifier(identifier);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    return isPasswordValid ? user : null;
  }

  async login(user: User, deviceId: string, deviceName: string) {
    try {
      await this.tokenStorageService.deleteDeviceTokens(user.id, deviceId);

      const { access_token, refresh_token } =
        await this.tokenService.generateTokenPair({
          userId: user.id,
          email: user.email,
          deviceId,
          deviceName,
        });

      await this.tokenStorageService.createRefreshToken(
        refresh_token,
        user.id,
        deviceId,
        deviceName,
      );

      await this.userService.updateUser(user.id, { last_seen: new Date() });
      return {
        access_token,
        refresh_token,
        user: this.filterUserData(user),
      };
    } catch (error) {
      console.error(`Login failed for ${user.username}`, error);
      throw new InternalServerErrorException('Login failed');
    }
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userService.createUser(createUserDto);

    const verifyEmailToken = this.jwtService.sign({ sub: user.id });
    const clientUrl = this.configService.get<string>('CLIENT_URL');
    const verificationUrl = `${clientUrl}/auth/verify-email/${user.first_name}/${user.email}/${verifyEmailToken}`;

    await this.mailService.sendVerificationEmail(user.email, verificationUrl);

    return user;
  }

  async refreshTokens(refreshToken: string) {
    // 1. Verify JWT signature and decode
    const payload = await this.tokenService.verifyToken<JwtRefreshPayload>(
      TokenType.REFRESH,
      refreshToken,
    );
    // 2. Check if token exists in database (prevent reuse)
    const storedToken = await this.tokenStorageService.findToken(refreshToken);
    if (!storedToken) {
      throw new UnauthorizedException('Refresh token not found');
    } else if (storedToken.expiresAt < new Date()) {
      await this.tokenStorageService.deleteToken(refreshToken);
      throw new UnauthorizedException('Refresh token expired');
    }
    // 3. Delete old refresh token (security best practice)
    await this.tokenStorageService.deleteDeviceTokens(
      payload.sub,
      payload.deviceId,
    );
    // 4. Generate new tokens
    const { access_token, refresh_token } =
      await this.tokenService.generateTokenPair({
        userId: payload.sub,
        email: payload.email,
        deviceId: payload.deviceId,
        deviceName: payload.deviceName,
      });
    // 5. Save new refresh token
    await this.tokenStorageService.createRefreshToken(
      refresh_token,
      payload.sub,
      payload.deviceId,
      payload.deviceName,
    );

    return {
      access_token: access_token,
      refresh_token: refresh_token,
      email: payload.email,
      deviceName: payload.deviceName,
    };
  }

  async sendPasswordResetEmail(email: string): Promise<boolean> {
    const user = await this.userService.getUserByIdentifier(email);
    if (!user) return false;
    if (user.is_email_verified === false) {
      throw new UnauthorizedException('Email not verified');
    }
    const resetPasswordToken = this.jwtService.sign({ sub: user.id });
    const clientUrl = this.configService.get<string>('CLIENT_URL');
    const resetUrl = `${clientUrl}/auth/reset-password/${resetPasswordToken}`;

    await this.mailService.sendPasswordResetEmail(email, resetUrl);
    return true;
  }

  verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      void this.userService.updateUser(payload.sub, {
        is_email_verified: true,
      });
      return { message: 'Email verified successfully.' };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async setNewPasswordWithToken(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string }>(token);
      await this.userService.updatePassword(payload.sub, newPassword);
      return { message: 'Password reset successfully.' };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async logout(userId: string, deviceId: string): Promise<void> {
    try {
      await this.tokenStorageService.deleteDeviceTokens(userId, deviceId);
    } catch (error) {
      console.error('Logout failed:', error);
      throw new InternalServerErrorException('Failed to logout');
    }
  }

  async logoutAll(userId: string): Promise<void> {
    try {
      // Delete all refresh tokens for this user
      await this.tokenStorageService.deleteAllUserTokens(userId);
    } catch (error) {
      console.error('Logout from all devices failed:', error);
      throw new InternalServerErrorException(
        'Failed to logout from all devices',
      );
    }
  }

  private filterUserData(user: User): Partial<User> {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar: user.avatar,
      phone_number: user.phone_number,
      birthday: user.birthday,
      bio: user.bio,
      status: user.status,
      is_email_verified: user.is_email_verified,
    };
  }
}
