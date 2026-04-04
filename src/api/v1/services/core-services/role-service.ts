import { RoleRepository, RoleKey } from '../../repositories/core-repositories/role-repository';
import { RoleResponse, RolesListResponse } from '../../dtos/core-dtos/role-dto';

/**
 * Role Service - Business logic for role management
 */
export class RoleService {

    private static mapRoleToResponse(role: any): RoleResponse {
        return {
            ...role,
            permissions: role.permissions.map((p: any) => ({
                id: String(p.id),
                name: p.name,
                description: p.description,
                resource: p.resource,
                action: p.action
            }))
        };
    }

    /**
     * Get all roles with stats and details
     */
    static async getAllRoles(filters: any = {}): Promise<RolesListResponse> {
        // 1. Obtener estadísticas globales
        const stats = await RoleRepository.getStats();

        // 2. Obtener lista detallada de roles
        const roles = await RoleRepository.findAll(filters);

        // 3. Ensamblar respuesta
        return {
            stats,
            roles: roles.map(role => this.mapRoleToResponse(role))
        };
    }

    /**
     * Get details for a specific role
     */
    static async getRoleByName(roleName: RoleKey): Promise<RoleResponse> {

        const role = await RoleRepository.findByName(roleName);

        if (!role) {
            throw new Error(`Role '${roleName}' not found`);
        }

        return this.mapRoleToResponse(role);
    }
}
