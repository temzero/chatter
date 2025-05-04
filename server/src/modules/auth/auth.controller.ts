import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
  Query,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseData } from 'src/common/response-data';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

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

  @Post('register')
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ResponseData<User>> {
    try {
      const user = await this.authService.register(createUserDto);
      return new ResponseData<User>(
        user,
        HttpStatus.CREATED,
        'User registered successfully. Please check your email for verification.',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to register user due to server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send-password-reset-email')
  async sendVerificationEmail(@Body() body: { email: string }) {
    const result = await this.authService.sendPasswordResetEmail(body.email);
    if (!result) {
      throw new BadRequestException(
        'Email not found or unable to send password reset email.',
      );
    }
    return { message: 'Verification email sent successfully.' };
  }

  @Post('reset-password')
  async resetPasswordWithToken(
    @Body() body: { token: string; newPassword: string },
  ) {
    const result = await this.authService.setNewPasswordWithToken(
      body.token,
      body.newPassword,
    );
    if (!result) {
      throw new BadRequestException(
        'Email not found or unable to reset password.',
      );
    }
    return { message: 'Password reset instructions sent to your email.' };
  }
}
