import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3002'),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_DATABASE || 'dev-cmdv',
    user: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    schema: process.env.DB_SCHEMA || 'cashless',
    ssl: process.env.DB_SSL === 'true',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2'),
    // Keep low: pgbouncer handles connection aggregation above this layer
    poolMax: parseInt(process.env.DB_POOL_MAX || '5'),
  },

  redis: {
    url: process.env.REDIS_URL || '',
  },

  jwt: {
    secret: (() => {
      if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
      return process.env.JWT_SECRET;
    })(),

    refreshSecret: (() => {
      if (!process.env.JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET is required');
      return process.env.JWT_REFRESH_SECRET;
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '30d'
  },

  bac: {
    baseUrl: process.env.BAC_BASE_URL,
    apiKey: process.env.BAC_API_KEY
  },

  email: {
    service: process.env.EMAIL_SERVICE,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
};