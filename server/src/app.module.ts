import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ChatModule } from './modules/chat/chat.module';
import { FriendshipModule } from './modules/friendship/friendship.module';
import { MessageModule } from './modules/message/message.module';
import { AuthModule } from './modules/auth/modules/auth.module';
import { ChatMemberModule } from './modules/chat-member/chat-member.module';
import { SupabaseModule } from './modules/superbase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'chatter',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    AuthModule,
    ChatModule,
    ChatMemberModule,
    FriendshipModule,
    MessageModule,
    UserModule,
    SupabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
