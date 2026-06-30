import { models } from '../../../../database';
import { secureLogger } from '../../../../utils/secure-logger.utils';
import { Op, WhereOptions, where, cast, col } from 'sequelize';
import { RoleDTO, PermissionDTO } from '../../dtos/core-dtos/role-dto';

/**
 * Repository
 */
export class RoleRepository {

    /**
     * Obtener todos los roles del sistema
     */
    static async findAll(filters: { search?: string } = {}): Promise<RoleDTO[]> {
        try {
            let whereClause: WhereOptions = {};
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                whereClause = {
                    [Op.or]: [
                        where(cast(col('rol'), 'text'), {
                            [Op.iLike]: `%${searchLower}%`
                        }),
                        {
                            display_name: {
                                [Op.iLike]: `%${searchLower}%`
                            }
                        }
                    ]
                };
            }

            // Obtener roles desde la vista en lugar del objeto hardcodeado
            const rolesFromView = await models.v_roles.findAll({
                where: whereClause
            });

            const roles = await Promise.all(
                rolesFromView.map(async (roleRow): Promise<RoleDTO> => {
                    const roleKey = roleRow.rol as string;

                    // Conteo de usuarios activos por rol
                    const usersCount = await models.users.count({
                        where: {
                            role: roleKey,
                            is_active: true
                        }
                    });

                    // Permisos del rol
                    const rolePermissions = await models.role_permissions.findAll({
                        where: { role: roleKey },
                        include: [{
                            model: models.permissions,
                            as: 'permission',
                            attributes: ['id', 'name', 'description', 'resource', 'action']
                        }]
                    });

                    const permissions: PermissionDTO[] = rolePermissions
                        .map((rp: any) => rp.permission)
                        .filter(Boolean)
                        .map((p: any) => ({
                            id: p.id,
                            name: p.name,
                            description: p.description,
                            resource: p.resource,
                            action: p.action
                        }));

                    return {
                        id: roleKey,
                        name: roleKey,
                        displayName: roleRow.display_name,  // viene de la vista
                        description: roleRow.description,    // viene de la vista
                        usersCount,
                        permissions,
                        status: 'active',
                        createdAt: null
                    };
                })
            );

            return roles;

        } catch (error) {
            secureLogger.error('Error finding roles:', error);
            throw new Error('Failed to retrieve roles');
        }
    }

    /**
     * Estadísticas globales de roles
     */
    static async getStats(): Promise<{
        totalRoles: number;
        activeRoles: number;
        inactiveRoles: number;
        assignedUsers: number;
    }> {
        try {
            const totalRoles = await models.v_roles.count();

            const assignedUsers = await models.users.count({
                where: { is_active: true }
            });

            return {
                totalRoles,
                activeRoles: totalRoles,
                inactiveRoles: 0,
                assignedUsers
            };
        } catch (error) {
            secureLogger.error('Error getting role stats:', error);
            throw new Error('Failed to retrieve role statistics');
        }
    }

    /**
     * Buscar un rol por su key
     */
    static async findByName(roleName: string): Promise<RoleDTO | null> {
        try {
            const roleRow = await models.v_roles.findOne({ where: { rol: roleName } });
            if (!roleRow) {
                return null;
            }

            const usersCount = await models.users.count({
                where: {
                    role: roleName,
                    is_active: true
                }
            });

            const rolePermissions = await models.role_permissions.findAll({
                where: { role: roleName },
                include: [{
                    model: models.permissions,
                    as: 'permission',
                    attributes: ['id', 'name', 'description', 'resource', 'action']
                }]
            });

            const permissions: PermissionDTO[] = rolePermissions
                .map((rp: any) => rp.permission)
                .filter(Boolean)
                .map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    resource: p.resource,
                    action: p.action
                }));

            return {
                id: roleName,
                name: roleName,
                displayName: roleRow.display_name,
                description: roleRow.description,
                usersCount,
                permissions,
                status: 'active',
                createdAt: null
            };

        } catch (error) {
            secureLogger.error(`Error finding role ${roleName}:`, error);
            throw new Error(`Error finding role ${roleName}`);
        }
    }
}
