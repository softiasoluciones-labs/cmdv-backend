import { Router } from 'express';
import { AuthController } from '../controllers/auth-controllers/auth.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { authRateLimit } from '../../../middleware/rateLimit.middleware';
import {
    loginValidator,
    refreshTokenValidator,
    forgotPasswordValidator,
    resetPasswordValidator,
    changePasswordValidator,
    createUserByAdminValidator
} from '../validators/core-validators/auth.validators';

const router = Router();

/**
 * Public routes (no authentication required)
 */

// POST /api/v1/auth/login
router.post('/login', authRateLimit, loginValidator, AuthController.login);

// POST /api/v1/auth/refresh
router.post('/refresh', refreshTokenValidator, AuthController.refreshToken);

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', authRateLimit, forgotPasswordValidator, AuthController.forgotPassword);

// POST /api/v1/auth/reset-password
router.post('/reset-password', authRateLimit, resetPasswordValidator, AuthController.resetPassword);

/**
 * Protected routes (authentication required)
 */

// POST /api/v1/auth/change-password
router.post('/change-password', authMiddleware, changePasswordValidator, AuthController.changePassword);

// GET /api/v1/auth/me
router.get('/me', authMiddleware, AuthController.getCurrentUser);

// POST /api/v1/auth/create-user-by-admin
router.post('/create-user-by-admin', authMiddleware, createUserByAdminValidator, AuthController.createUserByAdmin);

export { router as authRoutes };
