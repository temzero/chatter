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
import { ChatPartnerResDto } from './dto/responses/user-response.dto';
import { FriendshipStatus } from '../friendship/constants/friendship-status.constants';
import { FriendshipService } from '../friendship/friendship.service';
import { MailService } from '../auth/mail/mail.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly tokenStorageService: TokenStorageService,
    private readonly friendshipService: FriendshipService,
    private readonly mailService: MailService,
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
  async getOtherUserByIdentifier(
    identifier: string,
    currentUserId: string,
  ): Promise<ChatPartnerResDto> {
    // Find the user
    const user = await this.userRepository.findOne({
      where: [
        { username: identifier },
        { email: identifier },
        { phoneNumber: identifier },
      ],
    });

    if (!user) {
      ErrorResponse.notFound('User not found');
    }

    let friendshipStatus: FriendshipStatus | null = null;

    // Only check friendship if currentUserId is provided
    if (currentUserId && currentUserId !== user.id) {
      friendshipStatus = await this.friendshipService.getFriendshipStatus(
        currentUserId,
        user.id,
      );
    }

    return {
      ...user,
      friendshipStatus,
    };
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
      const savedUser = await this.userRepository.save(user);
      return savedUser;
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

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<{ isSuccess: boolean; message: string }> {
    try {
      const user = await this.getUserById(userId);

      const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isMatch) {
        return {
          isSuccess: false,
          message: 'Current password is incorrect',
        };
      }

      user.passwordHash = await this.hashPassword(newPassword);
      await this.userRepository.save(user);

      return {
        isSuccess: true,
        message: 'Password updated successfully',
      };
    } catch (error) {
      console.error('Failed to update password:', error);
      return {
        isSuccess: false,
        message: 'An error occurred while updating the password',
      };
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

  async updateUsername(userId: string, username: string): Promise<User> {
    try {
      // Check if username is available
      const available = await this.isUsernameAvailable(username);
      if (!available) {
        ErrorResponse.conflict('Username is already taken');
      }
      // Update the username
      const user = await this.getUserById(userId);
      user.username = username;
      return await this.userRepository.save(user);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to update username');
    }
  }

  async sendPhoneVerification(
    userId: string,
    phoneNumber: string,
  ): Promise<void> {
    try {
      // In a real implementation, you would:
      // 1. Validate the phone number format
      // 2. Generate a verification code
      // 3. Store the code with an expiration time
      // 4. Send the code via SMS (using a service like Twilio)

      // For now, we'll just update the user's phone number
      const user = await this.getUserById(userId);
      user.phoneNumber = phoneNumber;
      user.phoneVerified = false; // Mark as unverified until verified
      await this.userRepository.save(user);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to send phone verification');
    }
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({
        where: { username },
      });
      return !user; // Available if no user found
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to check username availability');
    }
  }

  async sendEmailVerification(userId: string, email: string): Promise<void> {
    try {
      // Check if email is already in use by another user
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });

      if (existingUser && existingUser.id !== userId) {
        ErrorResponse.conflict('Email is already in use by another account');
      }

      // Update the user's email and mark as unverified
      const user = await this.getUserById(userId);
      user.email = email;
      user.emailVerified = false;
      await this.userRepository.save(user);

      // Generate verification token (you might want to use JWT or a random string)
      const verificationToken = 'generated-verification-token'; // Replace with actual token generation

      // Create verification URL
      const baseUrl = this.configService.get<string>('APP_BASE_URL');
      const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

      // Send verification email
      await this.mailService.sendVerificationEmail(email, verificationUrl);
    } catch (error) {
      ErrorResponse.throw(error, 'Failed to send email verification');
    }
  }
}
