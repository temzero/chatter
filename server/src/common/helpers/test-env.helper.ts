// test-env-helper.ts

import { EnvConfig } from '../config/env.config';

export function testEnvHelper() {
  console.log('🔧 === Environment Helper Test ===\n');

  // Basic App Configuration
  console.log('📱 APP CONFIGURATION:');
  console.log('   NODE_ENV:', EnvConfig.nodeEnv);
  console.log('   Client URL:', EnvConfig.clientUrl || '❌ NOT SET');
  console.log('   Is Development:', EnvConfig.isDev());
  console.log('   Is Production:', EnvConfig.isProd());
  console.log('');

  // Database Configuration
  console.log('🗄️  DATABASE CONFIGURATION:');
  const dbConfig = EnvConfig.database;
  console.log('   Host:', dbConfig.host);
  console.log('   Port:', dbConfig.port);
  console.log('   User:', dbConfig.user);
  console.log(
    '   Password:',
    dbConfig.password ? typeof dbConfig.password : '❌ MISSING',
  );
  console.log('   Database Name:', dbConfig.name);
  console.log('');

  // JWT Configuration
  console.log('🔐 JWT CONFIGURATION:');
  const jwtConfig = EnvConfig.jwt;
  console.log(
    '   Access Secret:',
    jwtConfig.access.secret !== 'default-access-secret'
      ? '✅ SET'
      : '❌ MISSING',
  );
  console.log('   Access Expiration:', jwtConfig.access.expiration);
  console.log(
    '   Refresh Secret:',
    jwtConfig.refresh.secret !== 'default-refresh-secret'
      ? '✅ SET'
      : '❌ MISSING',
  );
  console.log('   Refresh Expiration:', jwtConfig.refresh.expiration);
  console.log(
    '   Verification Secret:',
    jwtConfig.verification.secret !== 'default-verification-secret'
      ? '✅ SET'
      : '❌ MISSING',
  );
  console.log('   Verification Expiration:', jwtConfig.verification.expiration);
  console.log('   Algorithm:', jwtConfig.algorithm);
  console.log('');

  // Supabase Configuration
  console.log('☁️  SUPABASE CONFIGURATION:');
  const supabaseConfig = EnvConfig.supabase;
  console.log('   URL:', supabaseConfig.url || '❌ NOT SET');
  console.log('   Anon Key:', supabaseConfig.anonKey ? '✅ SET' : '❌ MISSING');
  console.log(
    '   Service Role Key:',
    supabaseConfig.serviceRoleKey ? '✅ SET' : '❌ MISSING',
  );
  console.log('   Avatar Bucket:', supabaseConfig.avatarBucket);
  console.log('   Attachments Bucket:', supabaseConfig.attachmentsBucket);
  console.log('');

  // LiveKit Configuration
  console.log('🎥 LIVEKIT CONFIGURATION:');
  const livekitConfig = EnvConfig.livekit;
  console.log('   URL:', livekitConfig.url || '❌ NOT SET');
  console.log('   API Key:', livekitConfig.apiKey ? '✅ SET' : '❌ MISSING');
  console.log(
    '   API Secret:',
    livekitConfig.apiSecret ? '✅ SET' : '❌ MISSING',
  );
  console.log('');

  // Email Configuration
  console.log('📧 EMAIL CONFIGURATION:');
  const emailConfig = EnvConfig.email;
  console.log('   Service:', emailConfig.service);
  console.log('   User:', emailConfig.user || '❌ NOT SET');
  console.log('   Password:', emailConfig.password ? '✅ SET' : '❌ MISSING');
  console.log('');

  // Utilities
  console.log('⚙️  UTILITIES:');
  console.log('   Bcrypt Salt Rounds:', EnvConfig.bcryptSaltRounds);
  console.log('');

  // Environment Variable Check Summary
  console.log('📊 ENVIRONMENT VARIABLE SUMMARY:');
  const envVars = [
    'NODE_ENV',
    'CLIENT_URL',
    'POSTGRES_HOST',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'JWT_VERIFICATION_SECRET',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'LIVEKIT_URL',
    'LIVEKIT_API_KEY',
    'LIVEKIT_API_SECRET',
    'EMAIL_USER',
    'EMAIL_PASS',
  ];

  envVars.forEach((envVar) => {
    const isSet = !!process.env[envVar];
    console.log(`   ${envVar}:`, isSet ? '✅' : '❌');
  });

  console.log('\n🔧 === Test Complete ===');
}
