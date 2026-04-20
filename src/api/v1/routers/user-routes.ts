import { Router } from 'express';
import { UserController } from '../controllers/core-controllers/user-controller';
import { authMiddleware } from '../../../middleware';
import { requireRole } from '../../../middleware/role-middleware';

const router = Router();

// All user routers requiered authentication
router.use(authMiddleware);

router.get('/users', requireRole('admin', 'super_admin'), UserController.getUsers);
router.get('/users/all', requireRole('admin', 'super_admin'), UserController.getAllUsersWithRolesAndPermissions);
router.post('/users', requireRole('admin', 'super_admin'), UserController.createNewUser);
router.put('/users/:id', requireRole('admin', 'super_admin'), UserController.updateUser);

// Get users by warehouse role 
router.get('/users/by-role', UserController.getUsersByRole);

export { router as userRoutes };
