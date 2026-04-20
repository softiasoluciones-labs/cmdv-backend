// src/services/user.service.ts
import { Op } from 'sequelize';
import {
    UsersRequestDto,
    UsersPaginatedResponse,
    UserResponseDto
} from '../../dtos/core-dtos/user-dto';
import { UserRepository } from '../../repositories/core-repositories/user.repository';
import { users, usersCreationAttributes } from '../../../../database/core/users';
import { models } from '../../../../database';

export class UserService {
    /**
     * Build where clause from filters (helper method)
     */
    private static buildWhereClause(filters?: any): any {
        const where: any = {};

        if (!filters) return where;

        if (filters.role) {
            where.role = filters.role;
        }

        if (filters.is_active !== undefined) {
            where.is_active = filters.is_active;
        }

        if (filters.search) {
            where[Op.or] = [
                { username: { [Op.iLike]: `%${filters.search}%` } },
                { email: { [Op.iLike]: `%${filters.search}%` } },
                { full_name: { [Op.iLike]: `%${filters.search}%` } }
            ];
        }

        if (filters.created_from || filters.created_to) {
            where.created_at = {};
            if (filters.created_from) {
                where.created_at[Op.gte] = filters.created_from;
            }
            if (filters.created_to) {
                where.created_at[Op.lte] = filters.created_to;
            }
        }

        return where;
    }

    /**
     * Map user model to response DTO
     */
    private static toUserResponseDto(user: any): UserResponseDto {
        const userData = user.toJSON ? user.toJSON() : user;

        const response: UserResponseDto = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role,
            is_active: userData.is_active,
            last_login: userData.last_login || undefined,
            password_changed_at: userData.password_changed_at || undefined,
            failed_login_attempts: userData.failed_login_attempts || 0,
            locked_until: userData.locked_until || undefined,
            created_at: userData.created_at || new Date(),
            updated_at: userData.updated_at || new Date(),
            created_by: userData.created_by || undefined,
            updated_by: userData.updated_by || undefined
        };

        // Add role_permissions if they exist
        if (userData.role_permissions) {
            response.role_permissions = userData.role_permissions.map((rp: any) => ({
                id: rp.id,
                role_id: rp.role_id,
                permission_id: rp.permission_id,
                created_at: rp.created_at || new Date(),
                updated_at: rp.updated_at || new Date(),
                permission: rp.permission ? {
                    id: rp.permission.id,
                    name: rp.permission.name,
                    description: rp.permission.description,
                    created_at: rp.permission.created_at || new Date(),
                    updated_at: rp.permission.updated_at || new Date()
                } : undefined
            }));
        }

        return response;
    }

    /**
     * Get paginated users with statistics (TODO en el servicio)
     */
    static async getUsersWithStats(
        options: UsersRequestDto = {}
    ): Promise<UsersPaginatedResponse> {
        try {
            // Validar y establecer valores por defecto
            const page = Math.max(1, options.page || 1);
            const limit = Math.min(Math.max(1, options.limit || 20), 100); // Máximo 100
            const offset = (page - 1) * limit;

            // Construir where clause
            const where = this.buildWhereClause(options.filters);

            // Obtener todos los datos necesarios en paralelo
            const [
                allUsers,           // Para paginar en memoria
                totalUsers,         // Conteo total
                statusCounts        // Estadísticas
            ] = await Promise.all([
                // 1. Obtener TODOS los usuarios (para paginar en servicio)
                UserRepository.findUsersWithFilters(where),

                // 2. Contar total de usuarios
                UserRepository.countUsers(where),

                // 3. Obtener estadísticas
                UserRepository.countByStatusAndRole(where)
            ]);

            // Paginar en el servicio (después de obtener todos los datos)
            const paginatedUsers = allUsers.slice(offset, offset + limit);

            // Mapear usuarios a DTOs
            const mappedUsers = paginatedUsers.map(user => this.toUserResponseDto(user));

            // Retornar respuesta estructurada
            return {
                totalUsers,
                activeUsers: statusCounts.activeUsers,
                inactiveUsers: statusCounts.inactiveUsers,
                admins: statusCounts.admins,
                page,
                limit,
                totalPages: Math.ceil(totalUsers / limit),
                data: mappedUsers
            };

        } catch (error) {
            console.error('Error in UserService.getUsersWithStats:', error);
            throw error;
        }
    }

    /**
     * Alternativa optimizada: Paginación en base de datos
     */
    static async getUsersWithStatsOptimized(
        options: UsersRequestDto = {}
    ): Promise<UsersPaginatedResponse> {
        try {
            const page = Math.max(1, options.page ?? 1);
            const limit = Math.min(Math.max(1, options.limit ?? 20), 100);
            const offset = (page - 1) * limit;
            const where = this.buildWhereClause(options.filters ?? {});

            // Para paginación optimizada, necesitamos hacer queries separados
            const [users, totalUsers, statusCounts] = await Promise.all([
                // Usuarios paginados desde DB (sin include de role_permissions ya que la asociación es por granted_by, no por role)
                models.users.findAll({
                    where,
                    limit,
                    offset,
                    order: [['created_at', 'DESC']],
                    attributes: { exclude: ['password_hash'] }
                }),

                // Conteo total
                UserRepository.countUsers(where),

                // Estadísticas
                UserRepository.countByStatusAndRole(where)
            ]);

            // Obtener permisos para cada usuario basado en su rol
            const usersWithPermissions = await Promise.all(
                users.map(async (user) => {
                    const userData = user.toJSON ? user.toJSON() : user;

                    // Obtener permisos del rol del usuario
                    const rolePermissions = await models.role_permissions.findAll({
                        where: { role: userData.role },
                        include: [
                            {
                                model: models.permissions,
                                as: "permission",
                                attributes: ['id', 'name', 'description']
                            }
                        ]
                    });

                    return {
                        ...userData,
                        role_permissions: rolePermissions.map((rp: any) => rp.toJSON ? rp.toJSON() : rp)
                    };
                })
            );

            // Mapear resultados
            const mappedUsers = usersWithPermissions.map(user => this.toUserResponseDto(user));

            return {
                totalUsers,
                activeUsers: statusCounts.activeUsers,
                inactiveUsers: statusCounts.inactiveUsers,
                admins: statusCounts.admins,
                page,
                limit,
                totalPages: Math.ceil(totalUsers / limit),
                data: mappedUsers
            };

        } catch (error) {
            console.error('Error in UserService.getUsersWithStatsOptimized:', error);
            throw error;
        }
    }

    /**
     * Get user by role
     */
    static async getUsersByRole(role: string): Promise<UserResponseDto[]> {
        try {
            const users = await UserRepository.findByRole(role);
            return users.map(user => this.toUserResponseDto(user));
        } catch (error) {
            console.error('Error in UserService.getUsersByRole:', error);
            throw error;
        }
    }

    /**
     * Create new user
     */
    static async createNewUser(user: usersCreationAttributes): Promise<UserResponseDto> {
        try {
            const newUser = await UserRepository.create(user);
            return this.toUserResponseDto(newUser);
        } catch (error) {
            console.error('Error in UserService.createNewUser:', error);
            throw error;
        }
    }

    /**
     * Get all users with roles and permissions (método original adaptado)
     */
    static async getAllUsersWithRolesAndPermissions(): Promise<UserResponseDto[]> {
        try {
            const users = await UserRepository.getListUsersWithRolesAndPermissions();
            return users.map(user => this.toUserResponseDto(user));
        } catch (error) {
            console.error('Error in UserService.getAllUsersWithRolesAndPermissions:', error);
            throw error;
        }
    }

    static async updateUser(id: string, user: usersCreationAttributes): Promise<UserResponseDto> {
        try {
            const updatedUser = await UserRepository.update(user, { where: { id } });
            return this.toUserResponseDto(updatedUser);
        } catch (error) {
            console.error('Error in UserService.updateUser:', error);
            throw error;
        }
    }

    /**
     * Helper para construir respuesta de error
     */
    private static buildErrorResponse(message: string): any {
        return {
            success: false,
            code: 500,
            message,
            data: null
        };
    }
}