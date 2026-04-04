import { Router } from 'express';
import { RoleController } from '../controllers/core-controllers/role-controller';
import { authMiddleware } from '../../../middleware/auth.middleware';

const router = Router();

/**
 * Protected routes (authentication required)
 * Roles management requires administrative privileges typically, 
 * but allow reading for authorized users.
 */

// GET /api/v1/roles - List all roles with stats
router.get('/roles', authMiddleware, RoleController.getRoles);

// GET /api/v1/roles/:name - Get specific role details
router.get('/roles/:name', authMiddleware, RoleController.getRoleByName);

export { router as roleRoutes };
