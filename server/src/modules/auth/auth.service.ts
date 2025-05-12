import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './types/jwt-payload.type';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  async validateUser(loginDto: LoginDto): Promise<User | null> {
    const { identifier, password } = loginDto;
    const user = await this.userService.getUserByIdentifier(identifier);
    if (!user) return null;

    const isPasswordValid =
      user && (await bcrypt.compare(password, user.password_hash));
    return isPasswordValid ? user : null;
  }

  async login(user: User, deviceId: string, deviceName?: string) {
    try {
      if (!deviceId) {
        throw new BadRequestException('Device ID is required');
      }

      const payload: JwtPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
      };

      const access_token = this.jwtService.sign(payload); // default expires in 1h
      const refresh_token = this.jwtService.sign(
        { sub: user.id },
        { expiresIn: '7d' },
      );

      await this.refreshTokenService.createRefreshToken(
        user.id,
        refresh_token,
        deviceId,
        deviceName,
      );

      await this.userService.updateUser(user.id, { last_seen: new Date() });

      return {
        access_token,
        refresh_token,
        deviceId,
        deviceName,
        user: this.filterUserData(user),
      };
    } catch (error) {
      console.error(`Login failed for ${user.username}`, error);
      throw new InternalServerErrorException('Login failed');
    }
  }

  async register(CreateUserDto: CreateUserDto): Promise<User> {
    const user = await this.userService.createUser(CreateUserDto);

    const verifyEmailToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '1h' },
    );
    const clientUrl = this.configService.get<string>('CLIENT_URL');
    const verificationUrl = `${clientUrl}/auth/verify-email/${user.first_name}/${user.email}/${verifyEmailToken}`;

    await this.mailService.sendVerificationEmail(user.email, verificationUrl);

    return user;
  }

  async sendPasswordResetEmail(email: string): Promise<boolean> {
    const user = await this.userService.getUserByIdentifier(email);
    if (!user) return false;
    if (user.is_email_verified === false) {
      throw new UnauthorizedException('Email not verified');
    }
    const resetPasswordToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '1h' },
    );
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
