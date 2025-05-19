import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/requests/create-user.dto';
import { UpdateUserDto } from './dto/requests/update-user.dto';
import { ResponseData } from 'src/common/response-data';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { UserResponseDto } from './dto/responses/user-response.dto';
import { AppError } from 'src/common/errors';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<ResponseData<UserResponseDto[]>> {
    try {
      const users = await this.userService.getAllUsers();
      return new ResponseData(
        plainToInstance(UserResponseDto, users),
        HttpStatus.OK,
        'Users retrieved successfully',
      );
    } catch (error) {
      AppError.throw(error, 'Failed to retrieve users');
    }
  }

  @Get(':userId')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('userId') userId: string,
  ): Promise<ResponseData<UserResponseDto>> {
    try {
      const user = await this.userService.getUserById(userId);
      return new ResponseData(
        plainToInstance(UserResponseDto, user),
        HttpStatus.OK,
        'User retrieved successfully',
      );
    } catch (error) {
      AppError.throw(error, 'Failed to retrieve user');
    }
  }

  @Get('/find/:identifier')
  @UseGuards(JwtAuthGuard)
  async findOneByIdentifier(
    @Param('identifier') identifier: string,
  ): Promise<ResponseData<UserResponseDto>> {
    try {
      const user = await this.userService.getUserByIdentifier(
        identifier.trim(),
      );
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return new ResponseData(
        plainToInstance(UserResponseDto, user),
        HttpStatus.OK,
        'User retrieved successfully',
      );
    } catch (error) {
      AppError.throw(error, 'Failed to retrieve user');
    }
  }

  @Post('create')
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ResponseData<UserResponseDto>> {
    try {
      const user = await this.userService.createUser(createUserDto);
      return new ResponseData(
        plainToInstance(UserResponseDto, user),
        HttpStatus.CREATED,
        'User created successfully',
      );
    } catch (error) {
      AppError.throw(error, 'Failed to create user', HttpStatus.BAD_REQUEST);
    }
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async update(
    @CurrentUser('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseData<UserResponseDto>> {
    try {
      const updatedUser = await this.userService.updateUser(
        userId,
        updateUserDto,
      );
      return new ResponseData(
        plainToInstance(UserResponseDto, updatedUser),
        HttpStatus.OK,
        'User updated successfully',
      );
    } catch (error) {
      AppError.throw(error, 'Failed to update user');
    }
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async remove(
    @CurrentUser('id') userId: string,
  ): Promise<ResponseData<boolean>> {
    try {
      await this.userService.deleteUser(userId);
      return new ResponseData(true, HttpStatus.OK, 'User deleted successfully');
    } catch (error) {
      AppError.throw(error, 'Failed to delete user');
    }
  }
}
