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
import { EnvHelper } from './common/helpers/env.helper';
import * as dotenv from 'dotenv';

dotenv.config(); // <-- Load env vars FIRST
console.log('database:', EnvHelper.database);

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: EnvHelper.database.host,
      port: EnvHelper.database.port,
      username: EnvHelper.database.user,
      password: EnvHelper.database.password,
      database: EnvHelper.database.name,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: EnvHelper.nodeEnv !== 'production',
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
