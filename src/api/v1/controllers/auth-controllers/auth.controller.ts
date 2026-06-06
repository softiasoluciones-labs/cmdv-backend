import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../../services/core-services/auth-service';
import { successResponse, errorResponse } from '../../../../utils/response.utils';

/**
 * Authentication Controller - handles HTTP requests
 */
export class AuthController {
    /**
     * Login endpoint
     * POST /api/v1/auth/login
     */
    static async login(req: Request, res: Response): Promise<void> {

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                errorResponse(res, 400, 'Validation failed', errors.array());
                return;
            }

            const { email, password } = req.body;

            const result = await AuthService.login(email, password);

            successResponse(res, 200, 'Login successful', result);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            errorResponse(res, 401, message);
        }
    }

    /**
     * Refresh token endpoint
     * POST /api/v1/auth/refresh
     */
    static refreshToken(req: Request, res: Response): void {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                errorResponse(res, 400, 'Validation failed', errors.array());
                return;
            }

            const { refreshToken } = req.body;

            const result = AuthService.refreshToken(refreshToken);

            successResponse(res, 200, 'Token refreshed successfully', result);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Token refresh failed';
            errorResponse(res, 401, message);
        }
    }

    /**
     * Forgot password endpoint
     * POST /api/v1/auth/forgot-password
     */
    static forgotPassword(req: Request, res: Response): void {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                errorResponse(res, 400, 'Validation failed', errors.array());
                return;
            }

            const { email } = req.body;

            const result = AuthService.forgotPassword(email);

            successResponse(res, 200, 'Password reset initiated', result);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Request failed';
            errorResponse(res, 500, message);
        }
    }

    /**
     * Reset password endpoint
     * POST /api/v1/auth/reset-password
     */
    static async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                errorResponse(res, 400, 'Validation failed', errors.array());
                return;
            }

            const { token, newPassword } = req.body;

            await AuthService.resetPassword(token, newPassword);

            successResponse(res, 200, 'Password reset successful', null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Password reset failed';
            errorResponse(res, 400, message);
        }
    }

    /**
     * Change password endpoint (requires authentication)
     * POST /api/v1/auth/change-password
     */
    static async changePassword(req: Request, res: Response): Promise<void> {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                errorResponse(res, 400, 'Validation failed', errors.array());
                return;
            }

            const { currentPassword, newPassword } = req.body;
            const userId = req.user?.userId;

            if (!userId) {
                errorResponse(res, 401, 'Unauthorized');
                return;
            }

            await AuthService.changePassword(userId, currentPassword, newPassword);

            successResponse(res, 200, 'Password changed successfully', null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Password change failed';
            errorResponse(res, 400, message);
        }
    }

    /**
     * Get current user endpoint (requires authentication)
     * GET /api/v1/auth/me
     */
    static getCurrentUser(req: Request, res: Response): void {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                errorResponse(res, 401, 'Unauthorized');
                return;
            }

            const user = AuthService.getCurrentUser(userId);

            successResponse(res, 200, 'User retrieved successfully', user);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Request failed';
            errorResponse(res, 404, message);
        }
    }

    /**
     * Create new user by admin endpoint
     * POST /api/v1/auth/create-user-by-admin
     */
    static async createUserByAdmin(req: Request, res: Response): Promise<void> {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                errorResponse(res, 400, 'Validation failed', errors.array());
                return;
            }

            const { email, password, name, role } = req.body;

            const result = await AuthService.createUserByAdmin({ email, password, name, role });

            successResponse(res, 200, 'User created successfully', result);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'User creation failed';
            errorResponse(res, 400, message);
        }
    }
}
