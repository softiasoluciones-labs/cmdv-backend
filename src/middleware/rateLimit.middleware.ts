import rateLimit, { Options } from "express-rate-limit";
import { parseTimeToMs } from "../utils/application.utils";
import { config } from "../config/config";
import { logger } from "../utils/logger";

const RATE_LIMIT_WINDOW = parseTimeToMs(process.env.RATE_LIMIT_WINDOW, 15 * 60 * 1000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 100);

const AUTH_RATE_LIMIT_WINDOW = parseTimeToMs(process.env.AUTH_RATE_LIMIT_WINDOW, 15 * 60 * 1000);
const AUTH_RATE_LIMIT_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX || 5);

// Shared Redis store ensures rate-limit counters are consistent across
// multiple Node processes / PM2 cluster workers. Falls back to in-memory
// when REDIS_URL is not set (single-process dev environments).
function buildRedisStore(): Options['store'] | undefined {
    if (!config.redis.url) {
        if (config.nodeEnv === 'production') {
            logger.warn('REDIS_URL not set — rate limiting uses in-memory store (not safe for multi-process deployments)');
        }
        return undefined;
    }

    try {
        // Dynamic require avoids hard failure when ioredis is not configured
        const Redis = require('ioredis');
        const RedisStore = require('rate-limit-redis');
        const client = new Redis(config.redis.url, { lazyConnect: true, enableOfflineQueue: false });
        client.on('error', (err: Error) => logger.error('Rate-limit Redis error:', err));
        logger.info('Rate limiting using Redis store');
        return new RedisStore({ sendCommand: (...args: string[]) => client.call(...args) });
    } catch (err) {
        logger.warn('Failed to create Redis rate-limit store, falling back to memory:', err);
        return undefined;
    }
}

const sharedStore = buildRedisStore();

export const rateLimitMiddleware = rateLimit({
    windowMs: RATE_LIMIT_WINDOW,
    max: RATE_LIMIT_MAX,
    ...(sharedStore ? { store: sharedStore } : {}),
    message: {
        success: false,
        code: 429,
        message: "Too many requests, please try again later",
        data: null,
        version: process.env.API_VERSION || "1.0.0",
        timestamp: new Date().toISOString(),
        errorCode: "RATE_LIMIT_EXCEEDED",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const authRateLimit = rateLimit({
    windowMs: AUTH_RATE_LIMIT_WINDOW,
    max: AUTH_RATE_LIMIT_MAX,
    ...(sharedStore ? { store: sharedStore } : {}),
    message: {
        success: false,
        code: 429,
        message: "Too many login attempts, please try again later",
        data: null,
        version: process.env.API_VERSION || "1.0.0",
        timestamp: new Date().toISOString(),
        errorCode: "AUTH_RATE_LIMIT_EXCEEDED",
    },
});
