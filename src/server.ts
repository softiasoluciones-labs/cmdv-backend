import { App } from './app';
import { config } from './config/config';
import { logger } from './utils/logger';

// Create app instance
const app = new App();

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', reason);
    process.exit(1);
});

// Start server
app.start(config.port);