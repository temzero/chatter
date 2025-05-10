import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/user/dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserByIdentifier(identifier: string): Promise<User | null> {
    if (identifier.startsWith('@')) {
      identifier.slice(1);
    }

    return this.userRepository.findOne({
      where: [
        { username: identifier },
        { email: identifier },
        { phone_number: identifier },
      ],
    });
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.getUserByIdentifier(createUserDto.email);
    if (existingUser) {
      throw new HttpException(
        'Email or username already taken',
        HttpStatus.CONFLICT,
      );
    }
    const password_hash: string = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password_hash,
    });
    return this.userRepository.save(user);
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    const user = await this.getUserById(id);
    if (!user) {
      return null;
    }
    const updated = Object.assign(user, updateUserDto);
    return this.userRepository.save(updated);
  }

  async deleteUser(id: string): Promise<User | null> {
    const user = await this.getUserById(id);
    if (!user) {
      return null;
    }
    await this.userRepository.remove(user);
    return user;
  }

  async updatePassword(
    userId: string,
    newPassword: string,
  ): Promise<User | null> {
    const user = await this.getUserById(userId);
    if (!user) {
      return null;
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    user.password_hash = password_hash;

    return this.userRepository.save(user);
  }

  async updatePasswordWithCheck(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<User | null> {
    const user = await this.getUserById(userId);
    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      throw new Error('Old password is incorrect');
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    return this.userRepository.save(user);
  }
}
