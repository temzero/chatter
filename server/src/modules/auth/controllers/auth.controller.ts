import {
  Controller,
  Post,
  Get,
  Body,
  BadRequestException,
  Query,
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
import { LocalGuard } from '../guards/local.guard';
import { JwtAuthGuard } from '../guards/jwt.guard';
import { CurrentUser } from '../decorators/user.decorator';
import { Request, Response } from 'express';
import { JwtPayload, JwtRefreshPayload } from '../types/jwt-payload.type';
import { setRefreshTokenCookie } from 'src/common/helpers/set-cookie.helper';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { RegisterDto } from '../dto/requests/register.dto';
import { LoginResponseDto } from '../dto/responses/login-response.dto';
import { TokenStorageService } from '../services/token-storage.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly tokenStorageService: TokenStorageService,
  ) {}

  @Post('login')
  @UseGuards(LocalGuard)
  async login(
    @Req() req: { user: User },
    @Res({ passthrough: true }) response: Response,
    @Headers('x-device-id') deviceId: string,
    @Headers('x-device-name') deviceName: string,
  ): Promise<ResponseData<LoginResponseDto>> {
    await this.tokenStorageService.deleteDeviceTokens(req.user.id, deviceId);

    const { user, accessToken, refreshToken } = await this.authService.login(
      req.user,
      deviceId,
      deviceName,
    );
    // Optional: Set HTTP-only cookie for web clients
    setRefreshTokenCookie(response, refreshToken, this.configService);
    return new ResponseData<LoginResponseDto>(
      {
        user,
        accessToken,
      },
      HttpStatus.OK,
      'Login successful',
    );
  }

  @Post('register')
  async register(
    @Headers('x-device-id') deviceId: string,
    @Headers('x-device-name') deviceName: string,
    @Res({ passthrough: true }) response: Response,
    @Body() registerDto: RegisterDto,
  ): Promise<ResponseData<LoginResponseDto>> {
    const { user, accessToken, refreshToken } = await this.authService.register(
      registerDto,
      deviceId,
      deviceName,
    );
    // Optional: Set HTTP-only cookie for web clients
    setRefreshTokenCookie(response, refreshToken, this.configService);
    return new ResponseData<LoginResponseDto>(
      {
        user,
        accessToken,
      },
      HttpStatus.CREATED,
      'User registered and logged in successfully. Please verify your email.',
    );
  }

  @Get('access-token')
  @UseGuards(JwtAuthGuard)
  jwtToken(@Headers('authorization') authHeader?: string) {
    const accessToken = authHeader?.split(' ')[1];
    if (!accessToken) {
      throw new BadRequestException('Access token not found');
    }
    const decodedToken = this.tokenService.decodeToken<JwtPayload>(accessToken);
    return decodedToken;
  }

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
    response.clearCookie('refreshToken');
    return { message: 'Logged out successfully' };
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  async logoutAll(
    @Res({ passthrough: true }) response: Response,
    @CurrentUser() user: User,
  ) {
    await this.authService.logoutAll(user.id);
    response.clearCookie('refreshToken');
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
      refreshToken: string;
    };

    const { accessToken, refreshToken, email, deviceName } =
      await this.authService.refreshTokens(user.refreshToken);

    // Optional: set HTTP-only cookie for web clients
    setRefreshTokenCookie(response, refreshToken, this.configService);

    return {
      accessToken,
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
