import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controllers';
import { UserService } from './user.service';
import { User } from 'src/modules/user/entities/user.entity';
import { TokenStorageService } from '../auth/services/token-storage.service';
import { RefreshToken } from '../auth/entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([RefreshToken]),
  ],
  controllers: [UserController],
  providers: [UserService, TokenStorageService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
