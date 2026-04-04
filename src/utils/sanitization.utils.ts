import crypto from 'crypto';
import validator from 'validator';
import mongoSanitize from 'express-mongo-sanitize';

/**
 * Sanitize string to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
export const sanitizeString = (input: string): string => {
    if (!input) return input;

    // Escape HTML characters
    const escaped = validator.escape(input);

    // Remove any remaining script tags
    return escaped.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

/**
 * Sanitize object to prevent NoSQL injection
 */
export const sanitizeObject = (obj: any): any => {
    return mongoSanitize.sanitize(obj);
};

/**
 * Validate and sanitize email
 */
export const sanitizeEmail = (email: string): string => {
    return validator.normalizeEmail(email) || email;
};

/**
 * Validate username (alphanumeric, underscore, hyphen only)
 */
export const isValidUsername = (username: string): boolean => {
    return /^[a-zA-Z0-9_-]{3,50}$/.test(username);
};

/**
 * Validate name (letters, spaces, hyphens, apostrophes only)
 */
export const isValidName = (name: string): boolean => {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]{2,100}$/.test(name);
};

/**
 * Generate cryptographically secure random token
 * @param bytes Number of random bytes (default: 32)
 * @returns Hex string of the token
 */
export const generateSecureToken = (bytes: number = 32): string => {
    return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hash a token using SHA-256
 * Used for storing password reset tokens
 */
export const hashToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Sanitize user input for database storage
 * Combines multiple sanitization strategies
 */
export const sanitizeInput = (input: any): any => {
    if (typeof input === 'string') {
        return sanitizeString(input);
    }

    if (typeof input === 'object' && input !== null) {
        return sanitizeObject(input);
    }

    return input;
};
