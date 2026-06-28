import { Sequelize, Options } from 'sequelize';
import { logger } from '../utils/logger';
import { config } from './config';

const isProd = config.nodeEnv === 'production';

const dbConfig: Options = {
    host: config.database.host,
    port: config.database.port,
    database: config.database.name,
    username: config.database.user,
    password: config.database.password,
    dialect: 'postgres',

    logging: !isProd ? (msg) => logger.debug(msg) : false,

    pool: {
        // Keep low when using pgbouncer: it handles connection aggregation above this
        max: config.database.poolMax,
        min: config.database.poolMin,
        acquire: 30000,
        idle: 10000,
    },

    define: {
        timestamps: true,
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