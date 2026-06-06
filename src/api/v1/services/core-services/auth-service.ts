import { UserRepository } from '../../repositories/core-repositories/user.repository';
import { hashPassword, comparePassword } from '../../../../utils/password.utils';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../../utils/jwt.utils';
import { UserResponse, LoginResponse, RefreshTokenResponse, ForgotPasswordResponse, UserCreateByAdminRequest } from '../../dtos/core-dtos/auth.dtos';
import { users, usersCreationAttributes } from '../../../../database/core/users';

/**
 * Authentication Service - handles business logic
 */
export class AuthService {
    /**
     * Convert User model to UserResponse (without password)
     */
    private static toUserResponse(user: users): UserResponse {
        return {
            id: user.id,
            email: user.email,
            name: user.full_name, // Map full_name to name
            role: user.role,
            createdAt: user.created_at || new Date(),
            updatedAt: user.updated_at || new Date()
        };
    }

    /**
     * Login user with email and password
     */
    static async login(email: string, password: string): Promise<LoginResponse> {
        let user: users;
        try {
            user = await UserRepository.findByEmail(email);
        } catch (error) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await comparePassword(password, user.password_hash);
        if (!isPasswordValid) {
            const failedLoginAttempts = (user.failed_login_attempts || 0) + 1;

            if (failedLoginAttempts >= 5) {
                const lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
                await UserRepository.updateLockedUntil(user.id, lockedUntil);
                await UserRepository.updateFailedLoginAttempts(user.id, failedLoginAttempts);
                throw new Error('Account locked due to too many failed login attempts');
            }

            await UserRepository.updateFailedLoginAttempts(user.id, failedLoginAttempts);
            throw new Error('Invalid credentials.');
        }

        const accessToken = generateAccessToken(user.id, user.email);
        const refreshToken = generateRefreshToken(user.id, user.email);

        const accessExpiresAt = new Date();
        accessExpiresAt.setDate(accessExpiresAt.getDate() + 7);

        const refreshExpiresAt = new Date();
        refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30);

        await UserRepository.storeRefreshToken(user.id, refreshToken, refreshExpiresAt);
        await UserRepository.updateLastLogin(user.id);

        return {
            accessToken,
            refreshToken,
            user: this.toUserResponse(user)
        };
    }

    /**
     * Refresh access token using refresh token
     */
    static async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
        try {
            // Verify the refresh token
            const decoded = verifyRefreshToken(refreshToken);

            // Verify token exists in database and is not revoked
            const isValid = await UserRepository.verifyRefreshToken(decoded.userId, refreshToken);

            if (!isValid) {
                throw new Error('Invalid refresh token');
            }

            // Generate new access token
            const accessToken = generateAccessToken(decoded.userId, decoded.email);

            return { accessToken };
        } catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }

    /**
     * Initiate forgot password process
     */
    static async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
        let user: users | null = null;
        try {
            user = await UserRepository.findByEmail(email);
        } catch (error) {
            // User not found - don't reveal for security
        }

        if (!user) {
            return {
                message: 'If the email exists, a reset token has been sent'
            };
        }

        const { generateSecureToken, hashToken } = await import('../../../../utils/sanitization.utils');
        const resetToken = generateSecureToken(32);
        const hashedToken = hashToken(resetToken);

        UserRepository.storeResetToken(hashedToken, user.id, 30);

        return {
            message: 'If the email exists, a reset token has been sent',
            resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        };
    }

    /**
     * Reset password using reset token
     */
    static async resetPassword(token: string, newPassword: string): Promise<void> {
        // Hash the token for lookup
        const { hashToken } = await import('../../../../utils/sanitization.utils');
        const hashedToken = hashToken(token);

        // Verify reset token and get user ID
        const userId = UserRepository.verifyResetToken(hashedToken);

        if (!userId) {
            throw new Error('Invalid or expired reset token');
        }

        // Hash new password
        const newPasswordHash = await hashPassword(newPassword);

        // Update user password
        const updated = await UserRepository.updatePassword(userId, newPasswordHash);

        if (!updated) {
            throw new Error('Failed to update password');
        }

        // Remove reset token after use
        UserRepository.removeResetToken(hashedToken);
    }

    /**
     * Change password for authenticated user
     */
    static async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        let user: users;
        try {
            user = await UserRepository.findById(userId);
        } catch (error) {
            throw new Error('User not found');
        }

        const isPasswordValid = await comparePassword(currentPassword, user.password_hash);

        if (!isPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        const newPasswordHash = await hashPassword(newPassword);

        const updated = await UserRepository.updatePassword(userId, newPasswordHash);

        if (!updated) {
            throw new Error('Failed to update password');
        }
    }

    /**
     * Get current user info
     */
    static async getCurrentUser(userId: string): Promise<UserResponse> {
        let user: users;
        try {
            user = await UserRepository.findById(userId);
        } catch (error) {
            throw new Error('User not found');
        }

        return this.toUserResponse(user);
    }

    /**
     * Create new user by admin 
     */
    static async createUserByAdmin(userData: UserCreateByAdminRequest): Promise<UserResponse> {
        // Hash the password
        const password_hash = await hashPassword(userData.password);

        // Create user data with properly mapped fields
        const userCreationData: usersCreationAttributes = {
            email: userData.email,
            password_hash: password_hash,
            full_name: userData.name,
            username: userData.email.split('@')[0] || userData.email, // Generate username from email, fallback to full email
            role: userData.role as any // Cast to the proper role enum
        };

        const newUser = await UserRepository.create(userCreationData);
        return this.toUserResponse(newUser);
    }
}
