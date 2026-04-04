import { logger } from './logger';

/**
 * Sensitive fields to redact from logs
 */
const SENSITIVE_FIELDS = [
    'password',
    'currentPassword',
    'newPassword',
    'token',
    'refreshToken',
    'accessToken',
    'resetToken',
    'authorization',
    'password_hash',
    'token_hash',
    'refresh_token_hash',
    'secret',
    'apiKey',
    'api_key',
    'creditCard',
    'ssn',
    'cvv',
];

/**
 * Patterns to redact from strings (credit cards, SSNs, etc.)
 */
const SENSITIVE_PATTERNS = [
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card
    /\b\d{3}[\s-]?\d{2}[\s-]?\d{4}\b/g,            // SSN
];

/**
 * Recursively redact sensitive fields from an object
 */
const redactSensitiveData = (obj: any, depth: number = 0): any => {
    // Prevent infinite recursion
    if (depth > 10) return '[MAX_DEPTH]';

    if (obj === null || obj === undefined) {
        return obj;
    }

    if (typeof obj === 'string') {
        // Redact sensitive patterns
        let redacted = obj;
        SENSITIVE_PATTERNS.forEach(pattern => {
            redacted = redacted.replace(pattern, '[REDACTED]');
        });
        return redacted;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => redactSensitiveData(item, depth + 1));
    }

    if (typeof obj === 'object') {
        const redacted: any = {};

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                // Check if field name is sensitive
                const lowerKey = key.toLowerCase();
                const isSensitive = SENSITIVE_FIELDS.some(field =>
                    lowerKey.includes(field.toLowerCase())
                );

                if (isSensitive) {
                    redacted[key] = '[REDACTED]';
                } else {
                    redacted[key] = redactSensitiveData(obj[key], depth + 1);
                }
            }
        }

        return redacted;
    }

    return obj;
};

/**
 * Secure logger wrapper that redacts sensitive information
 */
export const secureLogger = {
    /**
     * Log info with sensitive data redacted
     */
    info: (message: string, data?: any) => {
        const safeData = data ? redactSensitiveData(data) : undefined;
        logger.info(message, safeData);
    },

    /**
     * Log error with sensitive data redacted
     */
    error: (message: string, error?: any) => {
        const safeError = error ? redactSensitiveData(error) : undefined;
        logger.error(message, safeError);
    },

    /**
     * Log warning with sensitive data redacted
     */
    warn: (message: string, data?: any) => {
        const safeData = data ? redactSensitiveData(data) : undefined;
        logger.warn(message, safeData);
    },

    /**
     * Log debug with sensitive data redacted
     */
    debug: (message: string, data?: any) => {
        const safeData = data ? redactSensitiveData(data) : undefined;
        logger.debug(message, safeData);
    },
};
