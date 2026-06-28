import Express, { Application } from 'express';
import { logger } from './utils/logger';
import { routes } from './api/index';
import { errorHandlerMiddleware, loggerMiddleware, corsMiddleware, helmetMiddleware } from './middleware';
import { connectDatabase } from './config/sequelize';

export class App {
    public app: Application;

    constructor() {
        this.app = Express();
        this.initializeDatabase();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    private initializeDatabase(): void {
        connectDatabase().catch((error) => {
            console.error('Failed to connect to database:', error);
            process.exit(1);
        });
    }

    private initializeMiddlewares() {
        // Security headers - apply first
        this.app.use(helmetMiddleware);

        // CORS
        this.app.use(corsMiddleware);

        // Body parsing
        this.app.use(Express.json());
        this.app.use(Express.urlencoded({ extended: true }));

        // Logging
        this.app.use(loggerMiddleware);
    }

    private initializeRoutes(): void {
        // Versioned API
        this.app.use('/api', routes);

        // Health check (unversioned)
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                versions: ['v1']
            });
        });
    }

    private initializeErrorHandling(): void {
        this.app.use(errorHandlerMiddleware);
    }

    public start(port: number): import('http').Server {
        return this.app.listen(port, () => {
            logger.info(`Server is running on port ${port}`);
            logger.info(`API v1: http://localhost:${port}/api/v1`);
            logger.info(`Health check: http://localhost:${port}/health`);
        });
    }
}
