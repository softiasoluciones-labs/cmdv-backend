import rateLimit from "express-rate-limit";
import { parseTimeToMs } from "../utils/application.utils";

const RATE_LIMIT_WINDOW = parseTimeToMs(process.env.RATE_LIMIT_WINDOW, 15 * 60 * 1000);
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || 100);

const AUTH_RATE_LIMIT_WINDOW = parseTimeToMs(process.env.AUTH_RATE_LIMIT_WINDOW, 15 * 60 * 1000);
const AUTH_RATE_LIMIT_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX || 5);

export const rateLimitMiddleware = rateLimit({
    windowMs: RATE_LIMIT_WINDOW,
    max: RATE_LIMIT_MAX,
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
