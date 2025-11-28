// src/common/helpers/env.helper.ts
export class EnvConfig {
  // -------------------- App --------------------
  static get nodeEnv(): string {
    return process.env.NODE_ENV || 'development';
  }

  static get clientUrl(): string {
    return process.env.CLIENT_URL || '';
  }

  static get serverUrl(): string {
    return process.env.SERVER_URL || '';
  }

  static get parseLimit(): string {
    return process.env.BODY_PARSER_LIMIT || '100mb';
  }

  // ---------------- Database ------------------
  static get database() {
    return {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      name: process.env.POSTGRES_DB || 'chatter',
      ssl: process.env.POSTGRES_SSL === 'true',
    };
  }

  // -------------------- JWT -------------------
  static get jwt(): {
    access: { secret: string; expiration: number };
    refresh: { secret: string; expiration: number };
    verification: { secret: string; expiration: number };
    algorithm: string;
  } {
    return {
      access: {
        secret: process.env.JWT_ACCESS_SECRET || 'default-access-secret',
        expiration: parseInt(process.env.JWT_ACCESS_EXPIRATION || '900', 10),
      },
      refresh: {
        secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
        expiration: parseInt(
          process.env.JWT_REFRESH_EXPIRATION || '604800',
          10,
        ),
      },
      verification: {
        secret:
          process.env.JWT_VERIFICATION_SECRET || 'default-verification-secret',
        expiration: parseInt(process.env.VERIFICATION_EXPIRATION || '900', 10),
      },
      algorithm: process.env.JWT_ALGORITHM || 'HS256',
    };
  }

  // -------------------- Supabase -------------------
  static get supabase() {
    return {
      url: process.env.SUPABASE_URL || '',
      anonKey: process.env.SUPABASE_ANON_KEY || '',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      avatarBucket: process.env.SUPABASE_AVATAR_BUCKET || 'avatars',
      attachmentsBucket:
        process.env.SUPABASE_ATTACHMENTS_BUCKET || 'attachments',
    };
  }

  // -------------------- LiveKit -------------------
  static get livekit() {
    return {
      url: process.env.LIVEKIT_URL || '',
      apiKey: process.env.LIVEKIT_API_KEY || '',
      apiSecret: process.env.LIVEKIT_API_SECRET || '',
    };
  }

  // -------------------- Email -------------------
  static get email() {
    return {
      service: process.env.EMAIL_SERVICE || 'Gmail',
      user: process.env.EMAIL_USER || '',
      password: process.env.EMAIL_PASS || '',
    };
  }

  // -------------------- Utilities -------------------
  static get bcryptSaltRounds(): number {
    return parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
  }

  static isDev(): boolean {
    return this.nodeEnv === 'development';
  }

  static isProd(): boolean {
    return this.nodeEnv === 'production';
  }
}
