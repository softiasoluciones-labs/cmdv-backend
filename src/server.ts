import { App } from './app';
import { config } from './config/config';
import { logger } from './utils/logger';

const app = new App();
const server = app.start(config.port);

function gracefulShutdown(signal: string): void {
    logger.warn(`${signal} received — closing HTTP server gracefully`);
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });

    // Force exit if server doesn't close in time
    setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10_000).unref();
}

process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught exception — shutting down:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason: unknown) => {
    // Log and continue — do NOT exit on unhandled rejection;
    // a single async error should not kill all in-flight requests.
    logger.error('Unhandled promise rejection (non-fatal):', reason);
});

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));