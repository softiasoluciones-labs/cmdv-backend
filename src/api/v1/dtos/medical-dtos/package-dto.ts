export interface PackageResponse {
    id: string;
    code: string;
    name?: string;
    description?: string;
    doctor_type: "internal" | "external";
    internal_doctor_price?: number;
    external_doctor_price?: number;
    validity_days?: number;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
    package_details?: PackageDetailResponse[];
}

export interface PackageDetailResponse {
    id: string;
    package_id: string;
    product_id: string;
    quantity: number;
    notes?: string;
}

export interface PackageListResponse {
    id: string;
    name?: string;
    description?: string;
    price?: number;
    currency?: string;
    is_active?: boolean;
}


export interface PackageListFilters {
    is_active?: boolean;
    doctor_type?: "internal" | "external";
    code?: string;
    service_id?: string;
    year?: number;
}
