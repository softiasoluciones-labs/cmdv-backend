import { Router } from 'express';
import { UserController } from '../controllers/core-controllers/user-controller';
import { authMiddleware } from '../../../middleware';
import { requireRole } from '../../../middleware/role-middleware';

const router = Router();

// All user routers requiered authentication
router.use(authMiddleware);

// Get users
router.get('/users', requireRole('admin', 'super_admin'), UserController.getUsers);
router.get('/users/all', requireRole('admin', 'super_admin'), UserController.getAllUsersWithRolesAndPermissions);

// Create user
router.post('/users', requireRole('admin', 'super_admin'), UserController.createNewUser);

// Update user
router.put('/users/:id', requireRole('admin', 'super_admin'), UserController.updateUser);

// Get users by warehouse role
router.get('/users/by-role', UserController.getUsersByRole);

// Deactivate (soft delete) user
router.patch('/users/:id/deactivate', requireRole('admin', 'super_admin'), UserController.deactivateUser);

// Lock (block) user account
router.post('/users/:id/lock', requireRole('admin', 'super_admin'), UserController.lockUser);

// Unlock user account
router.post('/users/:id/unlock', requireRole('admin', 'super_admin'), UserController.unlockUser);

export { router as userRoutes };
