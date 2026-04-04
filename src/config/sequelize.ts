import dotenv from 'dotenv';
import { Sequelize, Options } from 'sequelize';
import { logger } from '../utils/logger';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

// Database configuration
const dbConfig: Options = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_DATABASE || 'dev-cmdv',
    username: process.env.DB_USERNAME || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    dialect: 'postgres',

    logging: env === 'development' ? (msg) => logger.debug(msg) : false,

    pool: {
        max: env === 'production' ? 10 : 5,
        min: env === 'production' ? 2 : 0,
        acquire: 30000,
        idle: 10000,
    },

    define: {
        timestamps: true, // Using custom created_at, updated_at fields
        underscored: true,
        freezeTableName: true,
    },
};

// Create Sequelize instance
export const sequelize = new Sequelize(dbConfig);

// Test connection
export const connectDatabase = async (): Promise<void> => {
    try {
        await sequelize.authenticate();
        logger.info('✅ Database connection established successfully');
        logger.info(`📊 Connected to: ${dbConfig.database}@${dbConfig.host}`);
    } catch (error) {
        logger.error('❌ Unable to connect to database:', error);
        throw error;
    }
};

export default sequelize;