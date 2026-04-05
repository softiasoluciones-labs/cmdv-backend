import { RoleRepository } from '../../repositories/core-repositories/role-repository';
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
        const stats = await RoleRepository.getStats();
        const roles = await RoleRepository.findAll(filters);

        return {
            stats,
            roles: roles.map(role => this.mapRoleToResponse(role))
        };
    }

    /**
     * Get details for a specific role
     */
    static async getRoleByName(roleName: string): Promise<RoleResponse> {

        const role = await RoleRepository.findByName(roleName);

        if (!role) {
            throw new Error(`Role '${roleName}' not found`);
        }

        return this.mapRoleToResponse(role);
    }
}
