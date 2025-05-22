import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/requests/update-user.dto';
import { SuccessResponse } from 'src/common/api-response/success';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { UserResponseDto } from './dto/responses/user-response.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<SuccessResponse<UserResponseDto[]>> {
    const users = await this.userService.getAllUsers();
    return new SuccessResponse(
      plainToInstance(UserResponseDto, users),
      'Users retrieved successfully',
    );
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  async findOneByIdentifier(
    @Param('identifier') identifier: string,
  ): Promise<SuccessResponse<UserResponseDto>> {
    const user = await this.userService.getUserByIdentifier(identifier.trim());
    return new SuccessResponse(
      plainToInstance(UserResponseDto, user),
      'User retrieved successfully',
    );
  }

  @Put()
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
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
