import {
  Controller,
  Post,
  Get,
  Body,
  BadRequestException,
  Query,
  Request,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ResponseData } from 'src/common/response-data';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LocalGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RequestUser } from './types/request-user.type';
import { CurrentUser } from './decorators/user.decorator';
import { AuthenticatedRequest } from './types/authenticated-request.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  @Get('jwt-token')
  @UseGuards(JwtAuthGuard)
  jwtToken(@CurrentUser() user: RequestUser) {
    return user;
  }

  @Post('login')
  @UseGuards(LocalGuard)
  login(@Request() req: AuthenticatedRequest) {
    const deviceId = req.headers['x-device-id'] as string;
    const deviceName = req.headers['x-device-name'] as string;
    return this.authService.login(req.user as User, deviceId, deviceName);
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
