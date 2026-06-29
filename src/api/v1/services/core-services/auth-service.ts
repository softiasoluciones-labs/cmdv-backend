import { UserRepository } from '../../repositories/core-repositories/user.repository';
import { hashPassword, comparePassword } from '../../../../utils/password.utils';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../../utils/jwt.utils';
import { parseJwtDurationToSeconds } from '../../../../utils/jwt-duration.utils';
import { config } from '../../../../config/config';
import { UserResponse, LoginResponse, RefreshTokenResponse, ForgotPasswordResponse, UserCreateByAdminRequest, Permission } from '../../dtos/core-dtos/auth.dtos';
import { users, usersCreationAttributes } from '../../../../database/core/users';

const ACCESS_TTL_SECONDS = parseJwtDurationToSeconds(config.jwt.expiresIn);
const REFRESH_TTL_SECONDS = parseJwtDurationToSeconds(config.jwt.refreshExpiresIn);

/**
 * Authentication Service - handles business logic
 */
export class AuthService {
    /**
     * Convert User model to UserResponse (without password)
     */
    private static toUserResponse(user: users, permissions?: Permission[]): UserResponse {
        const response: UserResponse = {
            id: user.id,
            email: user.email,
            name: user.full_name,
            role: user.role,
            createdAt: user.created_at || new Date(),
            updatedAt: user.updated_at || new Date()
        };

        if (permissions && permissions.length > 0) {
            response.permissions = permissions;
        }

        return response;
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

        const refreshExpiresAt = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);

        await UserRepository.storeRefreshToken(user.id, refreshToken, refreshExpiresAt);
        await UserRepository.updateLastLogin(user.id);

        const permissions = await UserRepository.getPermissionsByRole(user.role);

        return {
            accessToken,
            refreshToken,
            expiresIn: ACCESS_TTL_SECONDS,
            refreshExpiresIn: REFRESH_TTL_SECONDS,
            user: this.toUserResponse(user, permissions)
        };
    }

    /**
     * Refresh access token using refresh token.
     * Implements refresh-token rotation: the old refresh token is revoked
     * and a new pair (access + refresh) is issued.
     */
    static async refreshToken(oldRefreshToken: string): Promise<RefreshTokenResponse> {
        try {
            const decoded = verifyRefreshToken(oldRefreshToken);

            const isValid = await UserRepository.verifyRefreshToken(decoded.userId, oldRefreshToken);
            if (!isValid) {
                throw new Error('Invalid refresh token');
            }

            // Rotation: revoke the old token
            await UserRepository.revokeRefreshToken(decoded.userId, oldRefreshToken);

            // Issue a fresh pair
            const accessToken = generateAccessToken(decoded.userId, decoded.email);
            const refreshToken = generateRefreshToken(decoded.userId, decoded.email);

            const refreshExpiresAt = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);
            await UserRepository.storeRefreshToken(decoded.userId, refreshToken, refreshExpiresAt);

            return {
                accessToken,
                refreshToken,
                expiresIn: ACCESS_TTL_SECONDS,
                refreshExpiresIn: REFRESH_TTL_SECONDS,
            };
        } catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }

    /**
     * Logout: revoke the given refresh token. Idempotent — if the token
     * doesn't exist or is already revoked, the call still succeeds.
     */
    static async logout(refreshToken: string): Promise<void> {
        if (!refreshToken) return;
        try {
            const decoded = verifyRefreshToken(refreshToken);
            await UserRepository.revokeRefreshToken(decoded.userId, refreshToken);
        } catch {
            // Silently ignore invalid tokens on logout — the client is
            // discarding its own cookies anyway.
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
