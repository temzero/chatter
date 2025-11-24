import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { EnvConfig } from './common/config/env.config';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: EnvConfig.database.host,
      port: EnvConfig.database.port,
      username: EnvConfig.database.user,
      password: EnvConfig.database.password,
      database: EnvConfig.database.name,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: EnvConfig.nodeEnv !== 'production',

      extra: {
        // This option forces IPv4
        family: 4,
        // Connection pool settings
        max: 20,
        connectionTimeoutMillis: 30000,
        idleTimeoutMillis: 30000,
      },

      ssl: EnvConfig.database.ssl
        ? { rejectUnauthorized: false } // required for Supabase
        : false,
    }),

    // App modules
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
