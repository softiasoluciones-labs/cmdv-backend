import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export interface TokenPayload {
    userId: string;
    email: string;
}

/**
 * Generate an access token
 */
export const generateAccessToken = (userId: string, email: string): string => {
    const payload: TokenPayload = { userId, email };

    return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
    } as any); // Type assertion to bypass strict typing issue
};

/**
 * Generate a refresh token
 */
export const generateRefreshToken = (userId: string, email: string): string => {
    const payload: TokenPayload = { userId, email };

    return jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn
    } as any); // Type assertion to bypass strict typing issue
};

/**
 * Verify an access token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
    try {
        const decoded = jwt.verify(token, config.jwt.secret) as TokenPayload;
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired access token');
    }
};

/**
 * Verify a refresh token
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
    try {
        const decoded = jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
        return decoded;
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};
