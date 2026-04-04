export interface GlobalParameterResponse {
    id: string;
    category: string;
    parameter_key: string;
    parameter_value: string;
    data_type: "string" | "number" | "boolean" | "json" | "date" | "time" | "datetime" | "email" | "url";
    display_name: string;
    description?: string;
    is_editable?: boolean;
    is_visible?: boolean;
    sort_order?: number;
    created_at?: Date;
    updated_at?: Date;
    updated_by?: string;
}

export interface CreateGlobalParameterRequest {
    category: string;
    parameter_key: string;
    parameter_value: string;
    data_type: "string" | "number" | "boolean" | "json" | "date" | "time" | "datetime" | "email" | "url";
    display_name: string;
    description?: string;
    is_editable?: boolean;
    is_visible?: boolean;
    sort_order?: number;
}

export interface UpdateGlobalParameterRequest {
    category?: string;
    parameter_key?: string;
    parameter_value?: string;
    data_type?: "string" | "number" | "boolean" | "json" | "date" | "time" | "datetime" | "email" | "url";
    display_name?: string;
    description?: string;
    is_editable?: boolean;
    is_visible?: boolean;
    sort_order?: number;
}

export interface GlobalParameterFilters {
    category?: string;
    data_type?: string;
    is_editable?: boolean;
    is_visible?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}
