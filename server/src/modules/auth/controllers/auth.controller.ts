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
  HttpStatus,
} from '@nestjs/common';
import { AuthResponse } from '@shared/types/responses/auth.response';
import { SuccessResponse } from '@/common/api-response/success';
import { AuthService } from '../services/auth.service';
import { ErrorResponse } from '@/common/api-response/errors';
import { User } from '../../user/entities/user.entity';
import { LocalGuard } from '../guards/local.guard';
import { Request, Response } from 'express';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { RegisterDto } from '../dto/requests/register.dto';
import { TokenStorageService } from '../services/token-storage.service';
import { TokenService } from '../services/token.service';
import { JwtRefreshPayload } from '../types/jwt-payload.type';
import { getCountryCodeFromRequest } from '@/common/utils/getCountryFromRequest';
import { countryToLang } from '@/common/utils/countryToLanguage';
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie,
} from '@/common/helpers/set-cookie.helper';
import { UserService } from '@/modules/user/user.service';
import { UserResponseDto } from '@/modules/user/dto/responses/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly tokenStorageService: TokenStorageService,
  ) {}

  @Post('login')
  @UseGuards(LocalGuard)
  async login(
    @Req() req: Request & { user: User },
    @Res({ passthrough: true }) response: Response,
    @Headers('x-device-id') deviceId: string,
    @Headers('x-device-name') deviceName: string,
  ): Promise<AuthResponse> {
    try {
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
    } catch (error: unknown) {
      ErrorResponse.throw(error, 'Login failed', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('register')
  async register(
    @Headers('x-device-id') deviceId: string,
    @Headers('x-device-name') deviceName: string,
    @Res({ passthrough: true }) response: Response,
    @Req() req: Request,
    @Body() registerDto: RegisterDto,
  ): Promise<AuthResponse> {
    const countryCode = getCountryCodeFromRequest(req);
    const language = countryToLang(countryCode);

    let user: UserResponseDto | null = null;

    try {
      const result = await this.authService.register(
        registerDto,
        deviceId,
        deviceName,
        language,
      );

      user = result.user;

      setRefreshTokenCookie(response, result.refreshToken);

      return {
        accessToken: result.accessToken,
        user,
        message: `User ${user.firstName} registered and logged in successfully. Please verify your email.`,
      };
    } catch (error: unknown) {
      // rollback: delete the partially created user
      if (user?.id) {
        try {
          await this.userService.deleteUser(user.id);
        } catch (rollbackError) {
          console.error('Failed to rollback user creation:', rollbackError);
        }
      }

      ErrorResponse.throw(
        error,
        'Failed to register user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const refreshToken: string = request.cookies?.refreshToken as string;

      if (refreshToken) {
        const payload =
          this.tokenService.decodeToken<JwtRefreshPayload>(refreshToken);

        if (payload?.sub && payload.deviceId) {
          await this.tokenStorageService.deleteDeviceTokens(
            payload.sub,
            payload.deviceId,
          );
        }
      }

      clearRefreshTokenCookie(response);

      return new SuccessResponse(null, 'Logged out successfully');
    } catch (error: unknown) {
      // Still clear cookies even if token deletion fails
      clearRefreshTokenCookie(response);
      ErrorResponse.throw(
        error,
        'Logout failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('logout-all')
  async logoutAll(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const refreshToken = request.cookies?.refreshToken as string;

      if (refreshToken) {
        const payload =
          this.tokenService.decodeToken<JwtRefreshPayload>(refreshToken);

        if (payload?.sub) {
          await this.tokenStorageService.deleteAllUserTokens(payload.sub);
        }
      }

      clearRefreshTokenCookie(response);

      return new SuccessResponse(
        null,
        'Logged out from all devices successfully',
      );
    } catch (error: unknown) {
      clearRefreshTokenCookie(response);
      ErrorResponse.throw(
        error,
        'Logout from all devices failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponse> {
    try {
      const refreshTokenData = request.user as { refreshToken: string };

      const payload = await this.authService.refreshTokensWithSlidingExpiry(
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
    } catch (error: unknown) {
      // Clear invalid refresh token cookie
      clearRefreshTokenCookie(response);
      ErrorResponse.throw(
        error,
        'Token refresh failed',
        HttpStatus.UNAUTHORIZED,
      );
    }
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
  async sendVerificationEmail(
    @Body() body: { email: string },
    @Req() req: Request,
  ) {
    const countryCode = getCountryCodeFromRequest(req);
    const language = countryToLang(countryCode);

    const message = await this.authService.sendPasswordResetEmail(
      body.email,
      language, // Pass the language
    );
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
