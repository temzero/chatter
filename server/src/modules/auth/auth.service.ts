import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { MailService } from '../mail/mail.service';
// import type { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(
    usernameOrEmail: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.userService.getUserByIdentifier(usernameOrEmail);
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      return user;
    }
    return null;
  }

  login(user: User) {
    // const payload: JwtPayload = { sub: user.id };
    const token = this.jwtService.sign(user.id);

    // Return both token and essential user data
    return {
      access_token: token,
      user: {
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
      },
    };
  }

  async register(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userService.createUser(createUserDto);

    const token = this.jwtService.sign({ id: user.id }, { expiresIn: '1d' });
    const clientUrl = this.configService.get<string>('CLIENT_URL');
    const verificationUrl = `${clientUrl}/auth/verify-email/${user.first_name}/${user.email}/${token}`;

    await this.mailService.sendVerificationEmail(user.email, verificationUrl);

    return user;
  }

  async sendPasswordResetEmail(email: string): Promise<boolean> {
    const user = await this.userService.getUserByIdentifier(email);
    if (!user) return false;

    const token = this.jwtService.sign({ id: user.id }, { expiresIn: '1h' });
    const clientUrl = this.configService.get<string>('CLIENT_URL');
    const resetUrl = `${clientUrl}/auth/reset-password/${token}`;

    await this.mailService.sendPasswordResetEmail(email, resetUrl);
    return true;
  }

  verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify<{ id: string }>(token);
      void this.userService.updateUser(payload.id, { is_email_verified: true });
      return { message: 'Email verified successfully.' };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async setNewPasswordWithToken(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify<{ id: string }>(token);
      await this.userService.updatePassword(payload.id, newPassword);
      return { message: 'Password reset successfully.' };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
