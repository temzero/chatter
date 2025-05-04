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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/user/dto/update-user.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { ResponseData } from 'src/common/response-data';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<ResponseData<User[]>> {
    try {
      const users = await this.userService.getAllUsers();
      return new ResponseData<User[]>(
        users,
        HttpStatus.OK,
        'Users retrieved successfully',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to retrieve users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('create')
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ResponseData<User>> {
    try {
      const user = await this.userService.createUser(createUserDto);
      return new ResponseData<User>(
        user,
        HttpStatus.CREATED,
        'User created successfully',
      );
    } catch (error: unknown) {
      throw new HttpException(
        error || 'Failed to create user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseData<User>> {
    try {
      const user = await this.userService.getUserById(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return new ResponseData<User>(
        user,
        HttpStatus.OK,
        'User retrieved successfully',
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error || 'Failed to retrieve user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ResponseData<User>> {
    try {
      const updatedUser = await this.userService.updateUser(id, updateUserDto);
      if (!updatedUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return new ResponseData<User>(
        updatedUser,
        HttpStatus.OK,
        'User updated successfully',
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error || 'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseData<string>> {
    try {
      const deletedUser = await this.userService.deleteUser(id);
      if (!deletedUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return new ResponseData<string>(
        deletedUser.id,
        HttpStatus.OK,
        'User deleted successfully',
      );
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error || 'Failed to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
