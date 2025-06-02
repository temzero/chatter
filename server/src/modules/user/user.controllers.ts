import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Headers,
  InternalServerErrorException,
  Post,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserService } from './user.service';
import { SuccessResponse } from 'src/common/api-response/success';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import {
  ChatPartnerResDto,
  UserResponseDto,
} from './dto/responses/user-response.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { UpdateProfileDto } from './dto/requests/update-profile.dto';
import { SupabaseService } from '../superbase/supabase.service';
import { ChangePasswordDto } from './dto/requests/change-password.dto';
import { VerifyUsernameDto } from './dto/requests/verify-username.dto';
import { VerifyPhoneDto } from './dto/requests/verify-phone.dto';
import { VerifyEmailDto } from './dto/requests/verify-email.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly supabaseService: SupabaseService,
  ) {}

  @Get('me')
  async getCurrentUser(
    @CurrentUser() user: JwtPayload,
  ): Promise<SuccessResponse<UserResponseDto>> {
    const fullUser = await this.userService.getUserById(user.sub);
    return new SuccessResponse(
      plainToInstance(UserResponseDto, fullUser),
      'Current user retrieved successfully',
    );
  }

  @Get()
  async findAll(): Promise<SuccessResponse<UserResponseDto[]>> {
    const users = await this.userService.getAllUsers();
    return new SuccessResponse(
      plainToInstance(UserResponseDto, users),
      'Users retrieved successfully',
    );
  }

  @Get(':userId')
  async findOne(
    @Param('userId') userId: string,
  ): Promise<SuccessResponse<UserResponseDto>> {
    const user = await this.userService.getUserById(userId);
    return new SuccessResponse(
      plainToInstance(UserResponseDto, user),
      'User retrieved successfully',
    );
  }

  @Get('find/:identifier')
  async findOneByIdentifier(
    @CurrentUser('id') userId: string,
    @Param('identifier') identifier: string,
  ): Promise<SuccessResponse<ChatPartnerResDto>> {
    const user = await this.userService.getOtherUserByIdentifier(
      identifier.trim(),
      userId,
    );
    return new SuccessResponse(
      plainToInstance(ChatPartnerResDto, user),
      'User retrieved successfully',
    );
  }

  @Put('profile')
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<SuccessResponse<UserResponseDto>> {
    try {
      const updatedUser = await this.userService.updateUser(
        userId,
        updateProfileDto,
      );
      return new SuccessResponse(
        plainToInstance(UserResponseDto, updatedUser),
        'User updated successfully',
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      throw new InternalServerErrorException('Failed to update user profile');
    }
  }

  // @Put()
  // @UseInterceptors(FileInterceptor('avatar'))
  // async update(
  //   @CurrentUser('id') userId: string,
  //   @Body() updateUserDto: UpdateUserDto,
  //   @UploadedFile() file?: Express.Multer.File,
  // ): Promise<SuccessResponse<UserResponseDto>> {
  //   if (file) {
  //     const avatarUrl = await this.supabaseService.uploadFile(
  //       `users/${userId}/avatar`,
  //       file,
  //     );
  //     updateUserDto.avatar = avatarUrl;
  //   }

  //   const updatedUser = await this.userService.updateUser(
  //     userId,
  //     updateUserDto,
  //   );
  //   return new SuccessResponse(
  //     plainToInstance(UserResponseDto, updatedUser),
  //     'User updated successfully',
  //   );
  // }

  @Put('username')
  async updateUsername(
    @CurrentUser('id') userId: string,
    @Body() updateUsernameDto: VerifyUsernameDto,
  ): Promise<SuccessResponse<UserResponseDto>> {
    const updatedUser = await this.userService.updateUsername(
      userId,
      updateUsernameDto.username,
    );
    return new SuccessResponse(
      plainToInstance(UserResponseDto, updatedUser),
      'Username updated successfully',
    );
  }

  @Post('verify/username')
  async verifyUsername(
    @Body() verifyUsernameDto: VerifyUsernameDto,
  ): Promise<SuccessResponse<boolean>> {
    const isAvailable = await this.userService.isUsernameAvailable(
      verifyUsernameDto.username,
    );

    const message = isAvailable
      ? 'Username available'
      : 'Username is already taken';

    return new SuccessResponse(isAvailable, message);
  }

  @Put('password')
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<SuccessResponse<boolean>> {
    const { isSuccess, message } = await this.userService.changePassword(
      userId,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );

    return new SuccessResponse(isSuccess, message);
  }

  @Post('verify/phone/send')
  async sendPhoneVerification(
    @CurrentUser('id') userId: string,
    @Body() verifyPhoneDto: VerifyPhoneDto,
  ): Promise<SuccessResponse<{ message: string }>> {
    await this.userService.sendPhoneVerification(
      userId,
      verifyPhoneDto.phoneNumber,
    );
    return new SuccessResponse(
      { message: 'Verification code sent successfully' },
      'Phone verification initiated',
    );
  }

  @Post('verify/email/send')
  async sendEmailVerification(
    @CurrentUser('id') userId: string,
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<SuccessResponse<{ message: string }>> {
    await this.userService.sendEmailVerification(userId, verifyEmailDto.email);
    return new SuccessResponse(
      { message: 'Verification email sent successfully' },
      'Email verification initiated',
    );
  }

  @Delete()
  async remove(
    @Headers('x-device-id') deviceId: string,
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<UserResponseDto>> {
    if (!deviceId) {
      throw new BadRequestException('Device ID is required');
    }
    const user = await this.userService.deleteUser(userId, deviceId);
    return new SuccessResponse(
      plainToInstance(UserResponseDto, user),
      `User ${user.username} deleted successfully`,
    );
  }
}
