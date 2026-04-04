import morgan from 'morgan';
import { logger } from '../utils/logger';

// Custom morgan stream that writes to winston logger
const stream = {
    write: (message: string) => {
        logger.info(message.trim());
    }
};

/**
 * HTTP request logger middleware
 */
export const loggerMiddleware = morgan(
    process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
    { stream }
);
