/**
 * Admission category enum
 * E = Estudios/Exámenes (Medical Studies)
 * P = Procedimientos (Medical Procedures)
 * NULL = No specific category
 */
export enum AdmissionCategory {
    E = 'E',
    P = 'P',
    NULL = 'NULL'
}

/**
 * Response DTO for admission type
 */
export interface AdmissionTypeResponse {
    id: string;
    code: string;
    name: string;
    requires_hospitalization: boolean;
    requires_package: boolean;
    allows_transfer: boolean;
    requires_immediate_payment: boolean;
    category?: AdmissionCategory;
    description?: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

/**
 * Simplified response for listing admission types
 */
export interface AdmissionTypeListResponse {
    id: string;
    code: string;
    name: string;
    category?: AdmissionCategory;
    requires_hospitalization: boolean;
    requires_package: boolean;
    is_active: boolean;
}

/**
 * Request DTO for creating admission type (admin only)
 */
export interface CreateAdmissionTypeRequest {
    code: string;
    name: string;
    requires_hospitalization: boolean;
    requires_package: boolean;
    allows_transfer: boolean;
    requires_immediate_payment: boolean;
    category?: AdmissionCategory;
    description?: string;
    is_active?: boolean;
}

/**
 * Request DTO for updating admission type (admin only)
 */
export interface UpdateAdmissionTypeRequest {
    code?: string;
    name?: string;
    requires_hospitalization?: boolean;
    requires_package?: boolean;
    allows_transfer?: boolean;
    requires_immediate_payment?: boolean;
    category?: AdmissionCategory;
    description?: string;
    is_active?: boolean;
}

/**
 * Filter options for listing admission types
 */
export interface AdmissionTypeFilters {
    category?: AdmissionCategory;
    requires_hospitalization?: boolean;
    requires_package?: boolean;
    allows_transfer?: boolean;
    is_active?: boolean;
    search?: string; // Search in code, name, description
}
