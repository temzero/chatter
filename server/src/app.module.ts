import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ChatModule } from './modules/chat/chat.module';
import { FriendshipModule } from './modules/friendship/friendship.module';
import { MessageModule } from './modules/message/message.module';
import { AuthModule } from './modules/auth/modules/auth.module';
import { ChatMemberModule } from './modules/chat-member/chat-member.module';
import { SupabaseModule } from './modules/superbase/supabase.module';
import { WebSocketModule } from './modules/websocket/websocket.module';
import { FolderModule } from './modules/folder/folder.module';
import { CallModule } from './modules/call/call.module';
import { BootstrapModule } from './modules/bootstrap/bootstrap.module';
import { AttachmentModule } from './modules/attachment/attachment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isDocker = configService.get('IS_DOCKER') === 'true';

        return {
          type: 'postgres',
          host: isDocker
            ? 'postgres'
            : configService.get('DB_HOST') || 'localhost',
          port: configService.get<number>('DB_PORT') || 5432,
          username: configService.get('POSTGRES_USER') || 'postgres',
          password: configService.get('POSTGRES_PASSWORD') || 'password',
          database: configService.get('POSTGRES_DB') || 'chatter',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') !== 'production',
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    BootstrapModule,
    ChatModule,
    FolderModule,
    ChatMemberModule,
    FriendshipModule,
    MessageModule,
    AttachmentModule,
    UserModule,
    CallModule,
    SupabaseModule,
    WebSocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
