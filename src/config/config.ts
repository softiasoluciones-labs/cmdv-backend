import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3002'),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL || `postgresql://${process.env.DATABASE_USER}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    name: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    schema: process.env.DATABASE_SCHEMA || 'cashless',
    ssl: process.env.DATABASE_SSL === 'true',
    poolMin: parseInt(process.env.DATABASE_POOL_MIN || '2'),
    poolMax: parseInt(process.env.DATABASE_POOL_MAX || '10')
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
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