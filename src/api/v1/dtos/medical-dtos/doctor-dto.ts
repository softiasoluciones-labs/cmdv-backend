export interface DoctorResponse {
    id: string;
    user_id?: string;
    full_name?: string;
    medical_license: string;
    specialty_id?: string;
    specialty_name?: string;
    doctor_type: "internal" | "external";
    consultation_fee?: number;
    surgery_fee?: number;
    identification_number?: string;
    phone?: string;
    email?: string;
    address?: string;
    is_active?: boolean;
    created_at?: Date;
    updated_at?: Date;
}

export interface CreateDoctorRequest {
    user_id?: string;
    medical_license: string;
    specialty_id?: string;
    doctor_type: "internal" | "external";
    consultation_fee?: number;
    surgery_fee?: number;
    identification_number?: string;
    phone?: string;
    email?: string;
    address?: string;
    is_active?: boolean;
}

export interface UpdateDoctorRequest {
    user_id?: string;
    medical_license?: string;
    specialty_id?: string;
    doctor_type?: "internal" | "external";
    consultation_fee?: number;
    surgery_fee?: number;
    identification_number?: string;
    phone?: string;
    email?: string;
    address?: string;
    is_active?: boolean;
}

export interface DoctorListFilters {
    search?: string;
    doctor_type?: "internal" | "external";
    specialty_id?: string;
    isActive?: boolean;
}