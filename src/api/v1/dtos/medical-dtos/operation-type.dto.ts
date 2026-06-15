export interface OperationTypeResponse {
    id: string;
    code: string;
    name: string;
    description?: string | null;
    specialty_id?: string | null;
    specialty?: {
        id: string;
        name: string;
    } | null;
    complexity: "minor" | "intermediate" | "major" | "critical";
    estimated_duration_minutes?: number | null;
    base_cost: number;
    anesthesia_required?: boolean | null;
    pre_operative_requirements?: string[] | null;
    post_operative_care?: string[] | null;
    is_active?: boolean | null;
    created_at: Date;
}

export interface CreateOperationTypeRequest {
    code: string;
    name: string;
    description?: string | null;
    specialty_id?: string | null;
    complexity: "minor" | "intermediate" | "major" | "critical";
    estimated_duration_minutes?: number | null;
    base_cost: number;
    anesthesia_required?: boolean | null;
    pre_operative_requirements?: string[] | null;
    post_operative_care?: string[] | null;
}

export interface UpdateOperationTypeRequest {
    code?: string | null;
    name?: string | null;
    description?: string | null;
    specialty_id?: string | null;
    complexity?: "minor" | "intermediate" | "major" | "critical";
    estimated_duration_minutes?: number | null;
    base_cost?: number;
    anesthesia_required?: boolean | null;
    pre_operative_requirements?: string[] | null;
    post_operative_care?: string[] | null;
    is_active?: boolean | null;
}
