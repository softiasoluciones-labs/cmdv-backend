export interface UsersRequestDto {
    page?: number | undefined;
    limit?: number | undefined;
    filters?: UserFiltersDto | undefined;
}

export interface UserFiltersDto {
    role?: string | undefined;
    is_active?: boolean | undefined;
    search?: string | undefined;
    created_from?: Date | undefined;
    created_to?: Date | undefined;
}

export interface UserResponseDto {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    last_login?: Date;
    password_changed_at?: Date;
    failed_login_attempts: number;
    locked_until?: Date;
    created_at: Date;
    updated_at: Date;
    created_by?: string;
    updated_by?: string;
    role_permissions?: {
        id: number;
        role_id: number;
        permission_id: number;
        created_at: Date;
        updated_at: Date;
        permission?: {
            id: number;
            name: string;
            description?: string;
            created_at: Date;
            updated_at: Date;
        };
    }[];
}

export interface UsersPaginatedResponse {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    admins: number;
    page: number;
    limit: number;
    totalPages: number;
    data: UserResponseDto[];
}