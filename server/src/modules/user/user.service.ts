import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/requests/register.dto';
import { UpdateUserDto } from 'src/modules/user/dto/requests/update-user.dto';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/modules/user/entities/user.entity';
import { ErrorResponse } from 'src/common/api-response/errors';
import { TokenStorageService } from '../auth/services/token-storage.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly tokenStorageService: TokenStorageService,
  ) {}

  private normalizeIdentifier(identifier: string): string {
    return identifier.startsWith('@') ? identifier.slice(1) : identifier;
  }

  async getUserByIdentifier(identifier: string): Promise<User | null> {
    try {
      const normalizedIdentifier = this.normalizeIdentifier(identifier);
      const user = await this.userRepository.findOne({
        where: [
          { username: normalizedIdentifier },
          { email: normalizedIdentifier },
          { phoneNumber: normalizedIdentifier },
        ],
      });
      return user;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve user by identifier');
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) {
        ErrorResponse.notFound('User not found');
      }
      return user;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve user');
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to retrieve users');
    }
  }

  async hashPassword(password: string): Promise<string> {
    try {
      const saltRounds = parseInt(
        this.configService.get('BCRYPT_SALT_ROUNDS', '10'),
        10,
      );
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to hash password');
    }
  }

  async createUser(registerDto: RegisterDto): Promise<User> {
    try {
      const existingUser = await this.getUserByIdentifier(registerDto.email);
      if (existingUser) {
        ErrorResponse.conflict('Email or username already taken');
      }
      const user = this.userRepository.create({
        ...registerDto,
        passwordHash: await this.hashPassword(registerDto.password),
      });
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to create user');
    }
  }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      const user = await this.getUserById(userId);
      Object.assign(user, updateUserDto);
      return await this.userRepository.save(user);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to update user');
    }
  }

  async setUserOnlineStatus(
    id: string,
    isOnline: boolean, // Simple DTO with just isOnline
  ): Promise<User> {
    const user = await this.getUserById(id);

    user.isOnline = isOnline;
    user.lastActiveAt = new Date(); // Always set to current server time

    return this.userRepository.save(user);
  }

  async updatePassword(userId: string, newPassword: string): Promise<User> {
    try {
      const user = await this.getUserById(userId);
      user.passwordHash = await this.hashPassword(newPassword);
      return await this.userRepository.save(user);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to update password');
    }
  }

  async updatePasswordWithCheck(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<User> {
    try {
      const user = await this.getUserById(userId);

      const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isMatch) {
        ErrorResponse.unauthorized('Old password is incorrect');
      }

      user.passwordHash = await this.hashPassword(newPassword);
      return await this.userRepository.save(user);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to update password');
    }
  }

  async deleteUser(userId: string, deviceId: string): Promise<User> {
    try {
      const user = await this.getUserById(userId);
      await this.userRepository.remove(user);
      if (userId && deviceId) {
        await this.tokenStorageService.deleteDeviceTokens(userId, deviceId);
      }
      return user;
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to delete user');
    }
  }
}
