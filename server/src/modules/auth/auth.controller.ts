import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { usernameOrEmail: string; password: string }) {
    const user = await this.authService.validateUser(
      body.usernameOrEmail,
      body.password,
    );
    if (!user) {
      throw new UnauthorizedException('Wrong Username or Password!');
    }
    return this.authService.login(user);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string }) {
    const result = await this.authService.resetPassword(body.email);
    if (!result) {
      throw new BadRequestException(
        'Email not found or unable to reset password.',
      );
    }
    return { message: 'Password reset instructions sent to your email.' };
  }
}
