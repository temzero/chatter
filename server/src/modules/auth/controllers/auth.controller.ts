import {
  Controller,
  Post,
  Get,
  Body,
  BadRequestException,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
  Headers,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { ResponseData } from 'src/common/response-data';
import { User } from '../../user/entities/user.entity';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { LocalGuard } from '../guards/local.guard';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { CurrentUser } from '../decorators/user.decorator';
import { Request, Response } from 'express';
import { JwtPayload, JwtRefreshPayload } from '../types/jwt-payload.type';
import { setRefreshTokenCookie } from 'src/common/helpers/set-cookie.helper';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('login')
  @UseGuards(LocalGuard)
  async login(
    @Req() req: { user: User },
    @Res({ passthrough: true }) response: Response,
    @Headers('x-device-id') deviceId: string,
    @Headers('x-device-name') deviceName: string,
  ) {
    const { access_token, refresh_token, user } = await this.authService.login(
      req.user,
      deviceId,
      deviceName,
    );

    // Optional: Set HTTP-only cookie for web clients
    setRefreshTokenCookie(response, refresh_token, this.configService);

    return {
      access_token,
      user,
    };
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

  @Get('access-token')
  @UseGuards(JwtAuthGuard)
  jwtToken(
    @Headers('authorization') authHeader?: string,
    // @CurrentUser() user: User,
  ) {
    // return user;
    const accessToken = authHeader?.split(' ')[1];
    if (!accessToken) {
      throw new BadRequestException('Access token not found');
    }
    const decodedToken = this.tokenService.decodeToken<JwtPayload>(accessToken);
    return decodedToken;
  }

  // @Post('logout')
  // @UseGuards(JwtRefreshGuard)
  // async logout(
  //   @Req() request: Request,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   const user = request.user as {
  //     refresh_token: string;
  //   };
  //   const decodedToken = this.tokenService.decodeToken<JwtRefreshPayload>(
  //     user.refresh_token,
  //   );
  //   if (!decodedToken) {
  //     throw new BadRequestException('Invalid refresh token');
  //   }

  //   await this.authService.logout(decodedToken.sub, decodedToken.deviceId);
  //   response.clearCookie('refresh_token');
  //   return { message: 'Logged out successfully' };
  // }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = this.tokenService.getRefreshTokenFromRequest(request);
    const decodedToken =
      this.tokenService.decodeToken<JwtRefreshPayload>(refreshToken);
    if (!decodedToken) {
      throw new BadRequestException('Invalid refresh token');
    }

    await this.authService.logout(decodedToken.sub, decodedToken.deviceId);
    response.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  async logoutAll(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: User,
  ) {
    await this.authService.logoutAll(user.id);
    response.clearCookie('refresh_token');
    return { message: 'Logged out from all devices successfully' };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // The guard will validate and add the user info to request.user
    const user = request.user as {
      refresh_token: string;
    };

    const { access_token, refresh_token, email, deviceName } =
      await this.authService.refreshTokens(user.refresh_token);

    // Optional: set HTTP-only cookie for web clients
    setRefreshTokenCookie(response, refresh_token, this.configService);

    return {
      access_token,
      email,
      deviceName,
    };
  }

  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
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
