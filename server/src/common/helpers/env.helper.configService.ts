// src/common/helpers/env.helper.ts
import { ConfigService } from '@nestjs/config';

export class EnvHelper {
  private static configService: ConfigService;

  static initialize(configService: ConfigService) {
    this.configService = configService;
  }

  // App
  static get nodeEnv(): string {
    return this.get('NODE_ENV', 'development');
  }

  static get clientUrl(): string {
    return this.getRequired('CLIENT_URL');
  }

  static get serverUrl(): string {
    return this.getRequired('SERVER_URL');
  }

  // Database
  static get database() {
    return {
      host: this.getRequired('POSTGRES_HOST'),
      port: this.getNumber('POSTGRES_PORT', 5432),
      user: this.getRequired('POSTGRES_USER'),
      password: this.getRequired('POSTGRES_PASSWORD'),
      name: this.getRequired('POSTGRES_DB'),
    };
  }

  // JWT
  static get jwt() {
    return {
      access: {
        secret: this.getRequired('JWT_ACCESS_SECRET'),
        expiration: this.get('JWT_ACCESS_EXPIRATION', '15m'),
      },
      refresh: {
        secret: this.getRequired('JWT_REFRESH_SECRET'),
        expiration: this.get('JWT_REFRESH_EXPIRATION', '7d'),
      },
      verification: {
        secret: this.getRequired('JWT_VERIFICATION_SECRET'),
        expiration: this.get('VERIFICATION_EXPIRATION', '1h'),
      },
    };
  }

  // Email
  static get email() {
    return {
      service: this.get('EMAIL_SERVICE', 'Gmail'),
      user: this.getRequired('EMAIL_USER'),
      password: this.getRequired('EMAIL_PASS'),
    };
  }

  // Supabase
  static get supabase() {
    return {
      url: this.getRequired('SUPABASE_URL'),
      anonKey: this.getRequired('SUPABASE_ANON_KEY'),
      serviceRoleKey: this.getRequired('SUPABASE_SERVICE_ROLE_KEY'),
      avatarBucket: this.get('SUPABASE_AVATAR_BUCKET', 'avatars'),
      attachmentsBucket: this.get('SUPABASE_ATTACHMENTS_BUCKET', 'attachments'),
    };
  }

  // LiveKit
  static get livekit() {
    return {
      url: this.getRequired('LIVEKIT_URL'),
      apiKey: this.getRequired('LIVEKIT_API_KEY'),
      apiSecret: this.getRequired('LIVEKIT_API_SECRET'),
    };
  }

  // Utilities
  static get bcryptSaltRounds(): number {
    return this.getNumber('BCRYPT_SALT_ROUNDS', 10);
  }

  static isDev(): boolean {
    return this.nodeEnv === 'development';
  }

  static isProd(): boolean {
    return this.nodeEnv === 'production';
  }

  // Private helpers - FIXED: using this.configService
  private static get(key: string, defaultValue?: string): string {
    return this.configService.get(key) || defaultValue || '';
  }

  private static getRequired(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new Error(`Missing required env variable: ${key}`);
    }
    return value;
  }

  private static getNumber(key: string, defaultValue: number): number {
    const value = this.configService.get<string>(key);
    const parsed = value ? parseInt(value, 10) : defaultValue;
    return isNaN(parsed) ? defaultValue : parsed;
  }
}
