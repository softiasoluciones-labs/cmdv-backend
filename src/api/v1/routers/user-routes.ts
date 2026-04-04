import { Router } from 'express';
import { UserController } from '../controllers/core-controllers/user-controller';
import { authMiddleware } from '../../../middleware';

const router = Router();

// All user routers requiered authentication
router.use(authMiddleware);

router.get('/users', UserController.getUsers);
router.get('/users/all', UserController.getAllUsersWithRolesAndPermissions);
router.post('/users', UserController.createNewUser);

export { router as userRoutes };
