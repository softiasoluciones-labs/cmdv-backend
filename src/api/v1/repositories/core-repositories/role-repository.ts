import { models } from '../../../../database';
import { secureLogger } from '../../../../utils/secure-logger.utils';

/**
 * Metadata estática de roles (System Enums)
 */
export const ROLE_METADATA = {
    super_admin: {
        displayName: 'Super Administrador',
        description: 'Acceso total a todas las funcionalidades del sistema'
    },
    admin: {
        displayName: 'Administrador',
        description: 'Gestión administrativa del sistema y usuarios'
    },
    doctor: {
        displayName: 'Doctor',
        description: 'Personal médico con acceso a expedientes y consultas'
    },
    nurse: {
        displayName: 'Enfermero/a',
        description: 'Personal de enfermería, signos vitales y cuidados'
    },
    pharmacist: {
        displayName: 'Farmacéutico',
        description: 'Gestión de farmacia, dispensación y medicamentos'
    },
    receptionist: {
        displayName: 'Recepcionista',
        description: 'Gestión de citas, admisión y atención al cliente'
    },
    lab_technician: {
        displayName: 'Técnico de Laboratorio',
        description: 'Gestión de pruebas y resultados de laboratorio'
    },
    billing_staff: {
        displayName: 'Personal de Facturación',
        description: 'Gestión de cobros, facturas y caja'
    },
    warehouse_manager: {
        displayName: 'Gerente de Almacén',
        description: 'Gestión de inventario, stock y proveedores'
    }
} as const;

/**
 * Tipos derivados automáticamente
 */
export type RoleKey = keyof typeof ROLE_METADATA;

export interface PermissionDTO {
    id: number;
    name: string;
    description: string;
    resource: string;
    action: string;
}

export interface RoleDTO {
    id: RoleKey;
    name: RoleKey;
    displayName: string;
    description: string;
    usersCount: number;
    permissions: PermissionDTO[];
    status: 'active';
    createdAt: Date | null;
}

/**
 * Repository
 */
export class RoleRepository {

    /**
     * Obtener todos los roles del sistema
     */
    static async findAll(filters: { search?: string } = {}): Promise<RoleDTO[]> {
        try {
            let rolesList = Object.keys(ROLE_METADATA) as RoleKey[];

            // Filtro de búsqueda
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                rolesList = rolesList.filter(roleKey => {
                    const meta = ROLE_METADATA[roleKey];
                    return (
                        roleKey.toLowerCase().includes(searchLower) ||
                        meta.displayName.toLowerCase().includes(searchLower)
                    );
                });
            }

            const roles = await Promise.all(
                rolesList.map(async (roleKey): Promise<RoleDTO> => {
                    const meta = ROLE_METADATA[roleKey];

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
                            as: 'permission', // ⚠️ debe coincidir con la asociación
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
                        displayName: meta.displayName,
                        description: meta.description,
                        usersCount,
                        permissions,
                        status: 'active',
                        createdAt: null // System role (enum)
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
            const totalRoles = Object.keys(ROLE_METADATA).length;

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
    static async findByName(roleName: RoleKey): Promise<RoleDTO | null> {
        try {
            const meta = ROLE_METADATA[roleName];

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
                displayName: meta.displayName,
                description: meta.description,
                usersCount,
                permissions,
                status: 'active',
                createdAt: null
            };

        } catch (error) {
            secureLogger.error(`Error finding role ${roleName}:`, error);
            return null;
        }
    }
}
