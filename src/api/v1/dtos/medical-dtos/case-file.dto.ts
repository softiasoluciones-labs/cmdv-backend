/**
 * Case status enum
 */
export enum CaseStatus {
    ACTIVE = 'active',
    IN_TREATMENT = 'in_treatment',
    HOSPITALIZED = 'hospitalized',
    SURGERY_SCHEDULED = 'surgery_scheduled',
    RECOVERING = 'recovering',
    DISCHARGED = 'discharged',
    TRANSFERRED = 'transferred',
    DECEASED = 'deceased'
}

/**
 * Case status flow enum
 */
export enum CaseStatusFlow {
    C1_CREACION = 'C1_CREACION',
    C2_CANCELACION = 'C2_CANCELACION',
    C3_CERRADO = 'C3_CERRADO',
    CE_CARGOS_EXPEDIENTE = 'CE_CARGOS_EXPEDIENTE',
    CC_CONFIRMACION_CARGOS = 'CC_CONFIRMACION_CARGOS',
    TR_TRASLADO_PROCEDIMIENTO = 'TR_TRASLADO_PROCEDIMIENTO',
    RA_REAPERTURA = 'RA_REAPERTURA',
    EX_EXTORNO = 'EX_EXTORNO'
}

/**
 * Shift type enum
 */
export enum ShiftType {
    DAYTIME = 'daytime',
    NIGHTTIME = 'nighttime'
}

/**
 * Request DTO for creating a case file
 * Validation rules are applied based on admission type requirements
 */
export interface CreateCaseFileRequest {
    patient_id: string;
    admission_type_id: string;
    chief_complaint: string;
    initial_diagnosis?: string;
    shift_type?: ShiftType;
    notes?: string;

    // Conditional fields based on admission type
    // These will be validated in the service layer based on admission type rules

    /** Required if admission_type.requires_hospitalization = true */
    room_id?: string;

    /** Required if admission_type.requires_package = true */
    package_id?: string;

    /** Required if admission_type.requires_package = true */
    doctor_id?: string;

    /** Only allowed if admission_type.allows_transfer = true */
    is_transfer?: boolean;

    /** Required if is_transfer = true */
    transfer_from_case_id?: string;
}

/**
 * Request DTO for updating a case file
 */
export interface UpdateCaseFileRequest {
    discharge_date?: Date;
    initial_diagnosis?: string;
    final_diagnosis?: string;
    case_status?: CaseStatus;
    current_status_flow?: CaseStatusFlow;
    notes?: string;
}

/**
 * Request DTO for updating case status only
 */
export interface UpdateCaseStatusRequest {
    status: CaseStatusFlow;
    reason?: string;
    notes?: string;
}

/**
 * Response DTO for case file with all relations
 */
export interface CaseFileResponse {
    id: string;
    case_number: string;
    patient_id: string;
    admission_date: Date;
    discharge_date?: Date;
    admission_type: string; // Legacy field
    chief_complaint: string;
    initial_diagnosis?: string;
    final_diagnosis?: string;
    case_status: CaseStatus;
    total_cost?: number;
    shift_type: ShiftType;
    current_status_flow: CaseStatusFlow;
    is_transfer?: boolean;
    transfer_from_case_id?: string;
    notes?: string;
    created_at: Date;
    updated_at: Date;
    created_by?: string;
    admission_type_id?: string;

    // Relations
    patient?: {
        id: string;
        file_number: string;
        first_name: string;
        last_name: string;
    };

    admissionType?: {
        id: string;
        code: string;
        name: string;
        requires_hospitalization: boolean;
        requires_package: boolean;
        allows_transfer: boolean;
        requires_immediate_payment: boolean;
        category?: "E" | "P" | "NULL";
    };

    rooms?: Array<{
        id: string;
        room_number: string;
        room_type: string;
        check_in_date: Date;
        check_out_date?: Date;
    }>;

    packages?: Array<{
        id: string;
        package_name: string;
        doctor_name: string;
        price_applied: number;
    }>;
}

/**
 * Response DTO for simplified case file list
 */
export interface CaseFileListResponse {
    id: string;
    case_number: string;
    patient_name: string;
    admission_type_name?: string;
    admission_date: Date;
    case_status: CaseStatus;
    current_status_flow: CaseStatusFlow;
    shift_type?: ShiftType;
    total_cost?: number;
}

/**
 * Validation status enum
 */
export enum ValidationStatus {
    COMPLIANT = 'COMPLIANT',
    MISSING_ROOM = 'MISSING_ROOM',
    MISSING_PACKAGE = 'MISSING_PACKAGE',
    PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
    TRANSFER_NOT_ALLOWED = 'TRANSFER_NOT_ALLOWED'
}

/**
 * Response DTO for case validation
 */
export interface CaseValidationResponse {
    case_id: string;
    case_number: string;
    admission_type_code: string;
    admission_type_name: string;

    // Requirements
    requires_hospitalization: boolean;
    has_room_assigned: boolean;

    requires_package: boolean;
    has_package_assigned: boolean;

    allows_transfer: boolean;
    is_transfer: boolean;

    requires_immediate_payment: boolean;
    has_payment: boolean;

    // Overall status
    validation_status: ValidationStatus;
    validation_messages: string[];
}
