
export interface PermissionDTO {
    id: number;
    name: string;
    description: string;
    resource: string;
    action: string;
}

export interface RolePermissionDto {
    id: string;
    name: string;
    description: string;
    resource: string;
    action: string;
}

export interface RoleResponse {
    id: string; // Utilizaremos el nombre del rol como ID ya que es un enum
    name: string;
    displayName: string;
    description: string;
    usersCount: number;
    permissions: RolePermissionDto[];
    status: 'active' | 'inactive';
    createdAt: Date; // Fecha simulada o la del primer usuario
}

export interface RoleStats {
    totalRoles: number;
    activeRoles: number;
    inactiveRoles: number;
    assignedUsers: number;
}

export interface RolesListResponse {
    stats: RoleStats;
    roles: RoleResponse[];
}

export interface RoleFilter {
    search?: string;
    status?: 'active' | 'inactive';
}

export interface RoleDTO {
    id: string;
    name: string;
    displayName: string;
    description: string;
    usersCount: number;
    permissions: PermissionDTO[];
    status: "active";
    createdAt: Date | null;
}

export interface PermissionDTO {
    id: number;
    name: string;
    description: string;
    resource: string;
    action: string;
}