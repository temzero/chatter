import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/user/dto/update-user.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  private normalizeIdentifier(identifier: string): string {
    return identifier.startsWith('@') ? identifier.slice(1) : identifier;
  }

  async getUserByIdentifier(identifier: string): Promise<User | null> {
    const normalizedIdentifier = this.normalizeIdentifier(identifier);
    return this.userRepository.findOne({
      where: [
        { username: normalizedIdentifier },
        { email: normalizedIdentifier },
        { phone_number: normalizedIdentifier },
      ],
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(
      this.configService.get('BCRYPT_SALT_ROUNDS', '10'),
      10,
    );
    return bcrypt.hash(password, saltRounds);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.getUserByIdentifier(createUserDto.email);
    if (existingUser) {
      throw new HttpException(
        'Email or username already taken',
        HttpStatus.CONFLICT,
      );
    }

    const user = this.userRepository.create({
      ...createUserDto,
      password_hash: await this.hashPassword(createUserDto.password),
    });

    return this.userRepository.save(user);
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    const user = await this.getUserById(id);
    if (!user) return null;

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<User | null> {
    const user = await this.getUserById(id);
    if (!user) return null;

    await this.userRepository.remove(user);
    return user;
  }

  async updatePassword(
    userId: string,
    newPassword: string,
  ): Promise<User | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;

    user.password_hash = await this.hashPassword(newPassword);
    return this.userRepository.save(user);
  }

  async updatePasswordWithCheck(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<User | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      throw new HttpException(
        'Old password is incorrect',
        HttpStatus.UNAUTHORIZED,
      );
    }

    user.password_hash = await this.hashPassword(newPassword);
    return this.userRepository.save(user);
  }
}
