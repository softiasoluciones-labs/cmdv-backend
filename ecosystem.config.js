module.exports = {
    apps: [
        {
            name: 'cmdv-backend',
            script: 'dist/server.js',

            // Use all available CPU cores. Each worker is an independent Node process
            // with its own Sequelize pool — total DB connections = instances * DB_POOL_MAX.
            // Keep DB_POOL_MAX low (5) and let pgbouncer aggregate upstream.
            instances: 'max',
            exec_mode: 'cluster',

            // Graceful reload: wait for in-flight requests to finish before recycling
            wait_ready: true,
            listen_timeout: 10000,
            kill_timeout: 10000,

            env: {
                NODE_ENV: 'production',
            },

            env_development: {
                NODE_ENV: 'development',
                instances: 1,
                exec_mode: 'fork',
            },

            // Auto-restart on memory leak (adjust threshold to your RAM budget)
            max_memory_restart: '400M',

            // Log rotation
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            error_file: 'logs/pm2-error.log',
            out_file: 'logs/pm2-out.log',
            merge_logs: true,
        },
    ],
};
