/**
 * Service and service type dto
 */

export interface ServiceTypeResponse {
    id: string;
    name: string;
    code: string;
    description?: string | undefined;
    is_active?: boolean | undefined;
}

export interface ServicesRequest {
    code: string;
    name: string;
    service_type_id: string;
    description?: string | undefined;
    base_price: number;
    estimated_duration_minutes?: number | undefined;
    requires_preparation?: boolean | undefined;
    preparation_instructions?: string | undefined;
    is_active?: boolean | undefined;
}

export interface ServiceResponse {
    id: string;
    code: string;
    name: string;
    service_type_id: string;
    service_type?: ServiceTypeResponse | undefined;
    description?: string | undefined;
    base_price: number;
    estimated_duration_minutes?: number | undefined;
    requires_preparation?: boolean | undefined;
    preparation_instructions?: string | undefined;
    is_active?: boolean | undefined;
    created_at?: Date | undefined;
}

export interface ServiceListFilters {
    search?: string;
    service_type_id?: string;
    is_active?: boolean;
    code?: string;
}