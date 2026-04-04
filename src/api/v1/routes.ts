import { Router } from 'express';
import { authRoutes } from './routers/auth.routes';
import { inventoryRoutes } from './routers/inventory.routes';
import { medicalRoutes } from './routers/medical.routes';
import { userRoutes } from './routers/user-routes';
import { configRoutes } from './routers/config.routes';
import { rateLimitMiddleware } from '../../middleware/rateLimit.middleware';
import { roleRoutes } from './routers/role.routes';

const v1Router = Router();

// Apply rate limiting to all v1 routes
v1Router.use(rateLimitMiddleware);

// Mount auth routes
v1Router.use('/auth', authRoutes);

// Mount user routes
v1Router.use('/users', userRoutes);

// Role routes
v1Router.use('/roles', roleRoutes);

// Mount inventory routes
v1Router.use('/inventory', inventoryRoutes);

// Mount medical routes
v1Router.use('/medical', medicalRoutes);

// Mount config routes
v1Router.use('/config', configRoutes);

// Health check for v1
v1Router.get('/', (req, res) => {
    res.status(200).json({
        version: 'v1',
        status: 'OK',
        message: 'API v1 is running',
        endpoints: {
            auth: '/api/v1/auth',
            inventory: '/api/v1/inventory',
            medical: '/api/v1/medical',
            config: '/api/v1/config'
        }
    });
});

export { v1Router };
