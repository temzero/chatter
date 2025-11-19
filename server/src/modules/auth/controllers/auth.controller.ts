import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Headers,
  Req,
  Res,
} from '@nestjs/common';
import { AuthResponse } from 'src/shared/types/responses/auth.response';
import { SuccessResponse } from 'src/common/api-response/success';
import { AuthService } from '../services/auth.service';
import { ErrorResponse } from 'src/common/api-response/errors';
import { User } from '../../user/entities/user.entity';
import { LocalGuard } from '../guards/local.guard';
import { CurrentUser } from '../decorators/user.decorator';
import { Request, Response } from 'express';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { RegisterDto } from '../dto/requests/register.dto';
import { TokenStorageService } from '../services/token-storage.service';
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from 'src/common/helpers/set-cookie.helper';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenStorageService: TokenStorageService,
  ) {}

  @Post('login')
  @UseGuards(LocalGuard)
  async login(
    @Req() req: { user: User },
    @Res({ passthrough: true }) response: Response,
    @Headers('x-device-id') deviceId: string,
    @Headers('x-device-name') deviceName: string,
  ): Promise<AuthResponse> {
    await this.tokenStorageService.deleteDeviceTokens(req.user.id, deviceId);

    const { user, accessToken, refreshToken } = await this.authService.login(
      req.user,
      deviceId,
      deviceName,
    );

    setRefreshTokenCookie(response, refreshToken);

    return {
      accessToken,
      user,
      message: `Login successful, welcome back ${user.firstName}`,
    };
  }

  @Post('register')
  async register(
    @Headers('x-device-id') deviceId: string,
    @Headers('x-device-name') deviceName: string,
    @Res({ passthrough: true }) response: Response,
    @Body() registerDto: RegisterDto,
  ): Promise<AuthResponse> {
    const { user, accessToken, refreshToken } = await this.authService.register(
      registerDto,
      deviceId,
      deviceName,
    );

    setRefreshTokenCookie(response, refreshToken);

    return {
      accessToken,
      user,
      message: `User ${user.firstName} registered and logged in successfully. Please verify your email.`,
    };
  }

  @Post('logout')
  async logout(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser('id') userId: string,
    @Headers('x-device-id') deviceId: string,
  ) {
    await this.tokenStorageService.deleteDeviceTokens(userId, deviceId);
    clearRefreshTokenCookie(response);

    return new SuccessResponse(null, 'Logged out successfully');
  }

  @Post('logout-all')
  async logoutAll(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser('id') userId: string,
  ) {
    await this.tokenStorageService.deleteAllUserTokens(userId);
    clearRefreshTokenCookie(response);
    return new SuccessResponse(
      null,
      'Logged out from all devices successfully',
    );
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    // The guard will validate and add the user info to request.user
    const refreshTokenData = request.user as { refreshToken: string };

    const payload = await this.authService.refreshTokensFixed(
      refreshTokenData.refreshToken,
    );

    const newRefreshToken = payload.refreshToken;
    if (newRefreshToken) {
      setRefreshTokenCookie(response, newRefreshToken);
    }

    return {
      accessToken: payload.accessToken,
      message: 'Tokens refreshed successfully',
    };
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    try {
      const result = await this.authService.verifyEmail(token);
      return new SuccessResponse(result, 'Email verified successfully');
    } catch (error) {
      ErrorResponse.throw(error, 'Email verification fail');
    }
  }

  @Post('send-password-reset-email')
  async sendVerificationEmail(@Body() body: { email: string }) {
    const message = await this.authService.sendPasswordResetEmail(body.email);
    return message;
  }

  @Post('reset-password')
  async resetPasswordWithToken(
    @Body() body: { token: string; newPassword: string },
  ) {
    const message = await this.authService.setNewPasswordWithToken(
      body.token,
      body.newPassword,
    );
    return message;
  }
}
