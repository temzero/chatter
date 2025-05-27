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
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/requests/update-user.dto';
import { SuccessResponse } from 'src/common/api-response/success';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { UserResponseDto } from './dto/responses/user-response.dto';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { UpdateProfileDto } from './dto/requests/update-profile.dto';
import { SupabaseService } from '../superbase/supabase.service';

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

  @Get('/find/:identifier')
  async findOneByIdentifier(
    @Param('identifier') identifier: string,
  ): Promise<SuccessResponse<UserResponseDto>> {
    const user = await this.userService.getUserByIdentifier(identifier.trim());
    return new SuccessResponse(
      plainToInstance(UserResponseDto, user),
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

  @Put()
  async update(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<SuccessResponse<UserResponseDto>> {
    const updatedUser = await this.userService.updateUser(
      userId,
      updateUserDto,
    );
    return new SuccessResponse(
      plainToInstance(UserResponseDto, updatedUser),
      'User updated successfully',
    );
  }

  @Delete()
  async remove(
    @Headers('x-device-id') deviceId: string,
    @CurrentUser('id') userId: string,
  ): Promise<SuccessResponse<UserResponseDto>> {
    const user = await this.userService.deleteUser(userId, deviceId);
    return new SuccessResponse(
      plainToInstance(UserResponseDto, user),
      `User ${user.username} deleted successfully`,
    );
  }
}
