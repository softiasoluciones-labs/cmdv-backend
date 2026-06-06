export enum ScheduledOperationStatus {
    SCHEDULED = 'scheduled',
    CONFIRMED = 'confirmed',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    POSTPONED = 'postponed'
}

export enum OperationTeamRole {
    SURGEON = 'surgeon',
    ANESTHESIOLOGIST = 'anesthesiologist',
    SCRUB_NURSE = 'scrub_nurse',
    CIRCULATING_NURSE = 'circulating_nurse',
    ASSISTANT = 'assistant'
}

export interface CreateScheduledOperationRequest {
    case_file_id: string;
    operation_type_id: string;
    primary_surgeon_id: string;
    anesthesiologist_id?: string;
    scheduled_date: Date;
    estimated_duration_minutes: number;
    operating_room?: string;
    pre_operative_notes?: string;
}

export interface UpdateScheduledOperationRequest {
    scheduled_date?: Date;
    estimated_duration_minutes?: number;
    operating_room?: string;
    pre_operative_notes?: string;
    status?: ScheduledOperationStatus;
}

export interface UpdateScheduledOperationStatusRequest {
    status: ScheduledOperationStatus;
    reason?: string;
}

export interface AddOperationTeamMemberRequest {
    doctor_id: string;
    role: OperationTeamRole;
}

export interface ScheduledOperationResponse {
    id: string;
    case_file_id: string;
    case_file?: {
        id: string;
        case_number: string;
        patient?: {
            id: string;
            file_number: string;
            first_name: string;
            last_name: string;
        };
    };
    operation_type_id: string;
    operation_type?: {
        id: string;
        code: string;
        name: string;
        complexity: string;
    };
    primary_surgeon_id: string;
    primary_surgeon?: {
        id: string;
        first_name: string;
        last_name: string;
        specialty?: string;
    };
    anesthesiologist_id?: string;
    anesthesiologist?: {
        id: string;
        first_name: string;
        last_name: string;
    };
    scheduled_date: Date;
    estimated_duration_minutes: number;
    operating_room?: string;
    pre_operative_notes?: string;
    status: string;
    operation_teams?: Array<{
        id: string;
        doctor_id: string;
        doctor?: {
            first_name: string;
            last_name: string;
        };
        role: string;
    }>;
    created_at: Date;
    updated_at: Date;
}

export type ScheduledOperationListResponse = ScheduledOperationResponse;