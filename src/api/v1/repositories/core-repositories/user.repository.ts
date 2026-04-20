import { models } from '../../../../database';
import { users, usersCreationAttributes } from '../../../../database/core/users';
import { secureLogger } from '../../../../utils/secure-logger.utils';
import { hashPassword, comparePassword } from '../../../../utils/password.utils';
import { Op } from 'sequelize';
import { hashToken } from '../../../../utils/sanitization.utils';

interface ResetTokenData {
    token: string;
    userId: string;
    expiresAt: Date;
}

/**
 * User Repository - Data access layer for users
 * Now uses Sequelize models instead of dummy data
 */
export class UserRepository {
    // In-memory storage for reset tokens (temporary until we move to database)
    private static resetTokens: Map<string, ResetTokenData> = new Map();

    /**
     * Find user by email
     */
    static async findByEmail(email: string): Promise<users | null> {
        try {
            const user = await models.users.findOne({
                where: {
                    email,
                    is_active: true,
                    [Op.or]: [
                        { locked_until: null },
                        { locked_until: { [Op.lt]: new Date() } } // expirado
                    ]
                }
            });
            return user;
        } catch (error) {
            secureLogger.error('Error finding user by email:', error);
            return null;
        }
    }

    /**
     * Find user by ID
     */
    static async findById(userId: string): Promise<users | null> {
        try {
            const user = await models.users.findByPk(userId);
            return user;
        } catch (error) {
            secureLogger.error('Error finding user by ID:', error);
            return null;
        }
    }

    /**
     * Find user by username
     */
    static async findByUsername(username: string): Promise<users | null> {
        try {
            const user = await models.users.findOne({
                where: { username, is_active: true }
            });
            return user;
        } catch (error) {
            secureLogger.error('Error finding user by username:', error);
            return null;
        }
    }

    /**
     * Find users by role
     */
    static async findByRole(role: string): Promise<users[]> {
        try {
            const users = await models.users.findAll({
                where: { role, is_active: true }
            });
            return users;
        } catch (error) {
            secureLogger.error('Error finding users by role:', error);
            return [];
        }
    }

    /**
     * Create a new user
     */
    static async create(userData: usersCreationAttributes): Promise<users> {
        try {

            // Create user data with properly mapped fields
            const userCreationData: usersCreationAttributes = {
                email: userData.email,
                password_hash: userData.password_hash,
                full_name: userData.full_name,
                username: userData.email.split('@')[0] || userData.email, // Generate username from email, fallback to full email
                role: userData.role as any, // Cast to the proper role enum
                is_active: true,
                created_at: new Date(),
                updated_at: new Date(),
            };
            const user = await models.users.create(userCreationData);
            return user;
        } catch (error) {
            secureLogger.error('Error creating user:', error);
            throw new Error('Failed to create user: ' + error);
        }
    }

    /**
     * Update a user
     */
    static async update(userData: usersCreationAttributes, options: { where: { id: string } }): Promise<[number] | null> {
        try {
            const [affectedCount] = await models.users.update(userData, options);
            return [affectedCount];
        } catch (error: any) {
            secureLogger.error('Error updating user:', error);
            return [0];
        }
    }

    /**
     * Update user password
     */
    static async updatePassword(userId: string, newPasswordHash: string): Promise<boolean> {
        try {
            const [affectedCount] = await models.users.update(
                {
                    password_hash: newPasswordHash,
                    password_changed_at: new Date()
                },
                { where: { id: userId } }
            );

            if (affectedCount > 0) {
                // Also remove all refresh tokens for this user
                await this.removeAllRefreshTokens(userId);
                return true;
            }
            return false;
        } catch (error) {
            secureLogger.error('Error updating password:', error);
            return false;
        }
    }

    /**
     * Update last login time
     */
    static async updateLastLogin(userId: string): Promise<void> {
        try {
            await models.users.update(
                { last_login: new Date(), failed_login_attempts: 0, locked_until: null },
                { where: { id: userId } }
            );
        } catch (error) {
            secureLogger.error('Error updating last login:', error);
        }
    }

    /**
     * Store refresh token in database
     */
    static async storeRefreshToken(userId: string, refreshToken: string, expiresAt: Date): Promise<void> {
        try {
            await models.jwt_tokens.create({
                user_id: userId,
                token_hash: hashToken(refreshToken),
                refresh_token_hash: hashToken(refreshToken),
                expires_at: expiresAt,
                refresh_expires_at: expiresAt,
                is_revoked: false
            });
        } catch (error) {
            secureLogger.error('Error storing refresh token:', error);
        }
    }

    /**
     * Verify refresh token exists and is valid
     */
    static async verifyRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
        try {
            const token = await models.jwt_tokens.findOne({
                where: {
                    user_id: userId,
                    refresh_token_hash: hashToken(refreshToken),
                    is_revoked: false
                }
            });

            if (!token) {
                return false;
            }

            // Check if token is expired
            if (token.refresh_expires_at && new Date() > new Date(token.refresh_expires_at)) {
                // Revoke expired token
                await token.update({ is_revoked: true, revoked_at: new Date() });
                return false;
            }

            return true;
        } catch (error) {
            secureLogger.error('Error verifying refresh token:', error);
            return false;
        }
    }

    /**
     * Remove all refresh tokens for a user (on password change/reset)
     */
    static async removeAllRefreshTokens(userId: string): Promise<void> {
        try {
            await models.jwt_tokens.update(
                { is_revoked: true, revoked_at: new Date() },
                { where: { user_id: userId } }
            );
        } catch (error) {
            secureLogger.error('Error removing refresh tokens:', error);
        }
    }

    /**
     * Store password reset token (in-memory for now, should be in DB)
     */
    static storeResetToken(token: string, userId: string, expirationMinutes: number): void {
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

        this.resetTokens.set(token, {
            token,
            userId,
            expiresAt
        });
    }

    /**
     * Verify reset token and get user ID
     */
    static verifyResetToken(token: string): string | null {
        const resetData = this.resetTokens.get(token);

        if (!resetData) {
            return null;
        }

        // Check if expired
        if (new Date() > resetData.expiresAt) {
            this.resetTokens.delete(token);
            return null;
        }

        return resetData.userId;
    }

    /**
     * Remove reset token after use
     */
    static removeResetToken(token: string): void {
        this.resetTokens.delete(token);
    }

    static async updateFailedLoginAttempts(userId: string, attempts: number): Promise<void> {
        try {
            await models.users.update(
                { failed_login_attempts: attempts },
                { where: { id: userId } }
            );
        } catch (error) {
            secureLogger.error('Error updating failed login attempts:', error);
        }
    }

    static async updateLockedUntil(userId: string, lockedUntil: Date): Promise<void> {
        try {
            await models.users.update(
                { locked_until: lockedUntil },
                { where: { id: userId } }
            );
        } catch (error) {
            secureLogger.error('Error updating locked until:', error);
        }
    }

    /**
     * method to response users data with roles and permissions 
     * Required token jwt : yest
     */

    static async findUsersWithFilters(where: any = {}): Promise<users[]> {
        try {
            const users = await models.users.findAll({
                where,
                include: [
                    {
                        model: models.role_permissions,
                        include: [
                            {
                                model: models.permissions,
                                attributes: ['id', 'name', 'description']
                            }
                        ]
                    }
                ],
                attributes: { exclude: ['password_hash'] }
            });

            return users;
        } catch (error) {
            console.error('Error in UserRepository.findUsersWithFilters:', error);
            throw error;
        }
    }


    /**
     * Count users with filters
     */
    static async countUsers(where: any = {}): Promise<number> {
        try {
            return await models.users.count({ where });
        } catch (error) {
            console.error('Error in UserRepository.countUsers:', error);
            throw error;
        }
    }

    /**
     * Count users by status and role
     */
    static async countByStatusAndRole(where: any = {}): Promise<{
        activeUsers: number;
        inactiveUsers: number;
        admins: number;
    }> {
        try {
            const [activeUsers, inactiveUsers, admins] = await Promise.all([
                models.users.count({ where: { ...where, is_active: true } }),
                models.users.count({ where: { ...where, is_active: false } }),
                models.users.count({ where: { ...where, role: 'admin' } })
            ]);

            return { activeUsers, inactiveUsers, admins };
        } catch (error) {
            console.error('Error in UserRepository.countByStatusAndRole:', error);
            throw error;
        }
    }

    /**
     * Get all users with roles and permissions (método original)
     */
    static async getListUsersWithRolesAndPermissions(): Promise<users[]> {
        try {
            const users = await models.users.findAll({
                include: [
                    {
                        model: models.role_permissions,
                        include: [
                            {
                                model: models.permissions,
                                attributes: ['id', 'name', 'description']
                            }
                        ]
                    }
                ]
            });
            return users;
        } catch (error) {
            console.error('Error getting list of users with roles and permissions:', error);
            return [];
        }
    }

}
