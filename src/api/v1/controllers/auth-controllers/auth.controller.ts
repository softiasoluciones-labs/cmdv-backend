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
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json(errorResponse('Validation failed', errors.array()));
                return;
            }

            const { email, password } = req.body;

            // Call service
            const result = await AuthService.login(email, password);

            res.status(200).json(successResponse(result, 'Login successful'));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            res.status(401).json(errorResponse(message));
        }
    }

    /**
     * Refresh token endpoint
     * POST /api/v1/auth/refresh
     */
    static refreshToken(req: Request, res: Response): void {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json(errorResponse('Validation failed', errors.array()));
                return;
            }

            const { refreshToken } = req.body;

            // Call service
            const result = AuthService.refreshToken(refreshToken);

            res.status(200).json(successResponse(result, 'Token refreshed successfully'));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Token refresh failed';
            res.status(401).json(errorResponse(message));
        }
    }

    /**
     * Forgot password endpoint
     * POST /api/v1/auth/forgot-password
     */
    static forgotPassword(req: Request, res: Response): void {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json(errorResponse('Validation failed', errors.array()));
                return;
            }

            const { email } = req.body;

            // Call service
            const result = AuthService.forgotPassword(email);

            res.status(200).json(successResponse(result, 'Password reset initiated'));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Request failed';
            res.status(500).json(errorResponse(message));
        }
    }

    /**
     * Reset password endpoint
     * POST /api/v1/auth/reset-password
     */
    static async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json(errorResponse('Validation failed', errors.array()));
                return;
            }

            const { token, newPassword } = req.body;

            // Call service
            await AuthService.resetPassword(token, newPassword);

            res.status(200).json(successResponse(null, 'Password reset successful'));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Password reset failed';
            res.status(400).json(errorResponse(message));
        }
    }

    /**
     * Change password endpoint (requires authentication)
     * POST /api/v1/auth/change-password
     */
    static async changePassword(req: Request, res: Response): Promise<void> {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json(errorResponse('Validation failed', errors.array()));
                return;
            }

            const { currentPassword, newPassword } = req.body;
            const userId = req.user?.userId;

            if (!userId) {
                res.status(401).json(errorResponse('Unauthorized'));
                return;
            }

            // Call service
            await AuthService.changePassword(userId, currentPassword, newPassword);

            res.status(200).json(successResponse(null, 'Password changed successfully'));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Password change failed';
            res.status(400).json(errorResponse(message));
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
                res.status(401).json(errorResponse('Unauthorized'));
                return;
            }

            // Call service
            const user = AuthService.getCurrentUser(userId);

            res.status(200).json(successResponse(user, 'User retrieved successfully'));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Request failed';
            res.status(404).json(errorResponse(message));
        }
    }

    /**
     * Create new user by admin endpoint
     * POST /api/v1/auth/create-user-by-admin
     */
    static async createUserByAdmin(req: Request, res: Response): Promise<void> {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json(errorResponse('Validation failed', errors.array()));
                return;
            }

            const { email, password, name, role } = req.body;

            // Call service
            const result = await AuthService.createUserByAdmin({ email, password, name, role });

            res.status(200).json(successResponse(result, 'User created successfully'));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'User creation failed';
            res.status(400).json(errorResponse(message));
        }
    }
}
