import { Injectable } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    usernameOrEmail: string,
    password: string,
  ): Promise<User | null> {
    const user: User | null =
      await this.usersService.findByUsernameOrEmail(usernameOrEmail);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      return user;
    }
    return null;
  }

  login(user: User) {
    const payload = { sub: user.id, username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async resetPassword(email: string): Promise<boolean> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return false;
    }

    // Simulate password reset logic
    // In production, generate token and email it instead
    const temporaryPassword = Math.random().toString(36).slice(-8);
    await this.usersService.updatePassword(user.id, temporaryPassword);

    console.log(`Temporary password sent to ${email}: ${temporaryPassword}`);

    // Optionally send email here

    return true;
  }
}
