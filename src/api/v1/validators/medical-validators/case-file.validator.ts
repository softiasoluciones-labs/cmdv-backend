import { CreateCaseFileRequest, CaseStatus, CaseStatusFlow } from '../../dtos/medical-dtos/case-file.dto';
import { AdmissionTypeResponse } from '../../dtos/medical-dtos/admission-type.dto';

export type AdmissionTypeForValidation = Pick<AdmissionTypeResponse,
    'name' | 'requires_hospitalization' | 'requires_package' | 'allows_transfer' | 'requires_immediate_payment'
>;

interface ValidationResult {
    valid: boolean;
    message?: string;
    field?: string;
}

const ALLOWED_TRANSITIONS: Record<CaseStatusFlow, CaseStatusFlow[]> = {
    [CaseStatusFlow.C1_CREACION]: [
        CaseStatusFlow.CE_CARGOS_EXPEDIENTE,
        CaseStatusFlow.C2_CANCELACION,
        CaseStatusFlow.C3_CERRADO,
    ],
    [CaseStatusFlow.CE_CARGOS_EXPEDIENTE]: [
        CaseStatusFlow.CC_CONFIRMACION_CARGOS,
        CaseStatusFlow.C2_CANCELACION,
        CaseStatusFlow.TR_TRASLADO_PROCEDIMIENTO,
    ],
    [CaseStatusFlow.CC_CONFIRMACION_CARGOS]: [
        CaseStatusFlow.C3_CERRADO,
        CaseStatusFlow.TR_TRASLADO_PROCEDIMIENTO,
        CaseStatusFlow.EX_EXTORNO,
    ],
    [CaseStatusFlow.TR_TRASLADO_PROCEDIMIENTO]: [
        CaseStatusFlow.C3_CERRADO,
    ],
    [CaseStatusFlow.EX_EXTORNO]: [
        CaseStatusFlow.RA_REAPERTURA,
        CaseStatusFlow.C3_CERRADO,
    ],
    [CaseStatusFlow.RA_REAPERTURA]: [
        CaseStatusFlow.CE_CARGOS_EXPEDIENTE,
        CaseStatusFlow.C2_CANCELACION,
    ],
    [CaseStatusFlow.C2_CANCELACION]: [],
    [CaseStatusFlow.C3_CERRADO]: [],
};

export const STATUS_FLOW_TO_CASE_STATUS: Record<CaseStatusFlow, CaseStatus> = {
    [CaseStatusFlow.C1_CREACION]: CaseStatus.ACTIVE,
    [CaseStatusFlow.CE_CARGOS_EXPEDIENTE]: CaseStatus.IN_TREATMENT,
    [CaseStatusFlow.CC_CONFIRMACION_CARGOS]: CaseStatus.IN_TREATMENT,
    [CaseStatusFlow.TR_TRASLADO_PROCEDIMIENTO]: CaseStatus.TRANSFERRED,
    [CaseStatusFlow.EX_EXTORNO]: CaseStatus.ACTIVE,
    [CaseStatusFlow.RA_REAPERTURA]: CaseStatus.ACTIVE,
    [CaseStatusFlow.C2_CANCELACION]: CaseStatus.DISCHARGED,
    [CaseStatusFlow.C3_CERRADO]: CaseStatus.DISCHARGED,
};

const CLOSING_STATUSES: CaseStatusFlow[] = [CaseStatusFlow.C2_CANCELACION, CaseStatusFlow.C3_CERRADO];

const SIGNIFICANT_STATUSES: CaseStatusFlow[] = [
    CaseStatusFlow.C3_CERRADO,
    CaseStatusFlow.C2_CANCELACION,
    CaseStatusFlow.TR_TRASLADO_PROCEDIMIENTO,
    CaseStatusFlow.RA_REAPERTURA,
];

const STAGE_NAMES: Record<CaseStatusFlow, string> = {
    [CaseStatusFlow.C1_CREACION]: 'Case Created',
    [CaseStatusFlow.C2_CANCELACION]: 'Case Cancelled',
    [CaseStatusFlow.C3_CERRADO]: 'Case Closed',
    [CaseStatusFlow.CE_CARGOS_EXPEDIENTE]: 'Charges Applied',
    [CaseStatusFlow.CC_CONFIRMACION_CARGOS]: 'Charges Confirmed',
    [CaseStatusFlow.TR_TRASLADO_PROCEDIMIENTO]: 'Case Transferred',
    [CaseStatusFlow.RA_REAPERTURA]: 'Case Reopened',
    [CaseStatusFlow.EX_EXTORNO]: 'Case Reversed',
};

export class CaseFileValidator {
    static validateRoomRequirement(
        admissionType: AdmissionTypeForValidation,
        roomId?: string
    ): ValidationResult {
        if (admissionType.requires_hospitalization && !roomId) {
            return {
                valid: false,
                field: 'room_id',
                message: `Room assignment is required for admission type "${admissionType.name}"`
            };
        }
        return { valid: true };
    }

    static validatePackageRequirement(
        admissionType: AdmissionTypeForValidation,
        packageId?: string,
        doctorId?: string
    ): ValidationResult {
        if (admissionType.requires_package) {
            if (!packageId) {
                return {
                    valid: false,
                    field: 'package_id',
                    message: `Package assignment is required for admission type "${admissionType.name}"`
                };
            }
            if (!doctorId) {
                return {
                    valid: false,
                    field: 'doctor_id',
                    message: 'Doctor assignment is required when package is assigned'
                };
            }
        }
        return { valid: true };
    }

    static validateTransferAllowance(
        admissionType: AdmissionTypeForValidation,
        isTransfer?: boolean,
        transferFromCaseId?: string
    ): ValidationResult {
        if (isTransfer && !admissionType.allows_transfer) {
            return {
                valid: false,
                field: 'is_transfer',
                message: `Transfers are not allowed for admission type "${admissionType.name}"`
            };
        }
        if (isTransfer && !transferFromCaseId) {
            return {
                valid: false,
                field: 'transfer_from_case_id',
                message: 'Transfer source case ID is required when is_transfer is true'
            };
        }
        return { valid: true };
    }

    static validatePaymentRequirement(
        admissionType: AdmissionTypeForValidation,
        hasPayment: boolean
    ): ValidationResult {
        if (admissionType.requires_immediate_payment && !hasPayment) {
            // TODO: Check billing.invoices table when billing module is integrated
            return {
                valid: true,
                message: `Note: This admission type requires immediate payment`
            };
        }
        return { valid: true };
    }

    static validateStatusTransition(
        admissionType: AdmissionTypeForValidation,
        currentStatus: CaseStatusFlow,
        newStatus: CaseStatusFlow,
        hasPayment: boolean = false
    ): ValidationResult {
        if (newStatus === CaseStatusFlow.TR_TRASLADO_PROCEDIMIENTO && !admissionType.allows_transfer) {
            return {
                valid: false,
                field: 'status',
                message: `Cannot transfer case: admission type "${admissionType.name}" does not allow transfers`
            };
        }

        if (newStatus === CaseStatusFlow.C3_CERRADO && admissionType.requires_immediate_payment && !hasPayment) {
            // TODO: Enforce strictly when billing module is integrated
            return {
                valid: true,
                message: 'Warning: This case requires payment before closure'
            };
        }

        const allowed = ALLOWED_TRANSITIONS[currentStatus] ?? [];
        if (!allowed.includes(newStatus)) {
            return {
                valid: false,
                field: 'status',
                message: `Invalid status transition from ${currentStatus} to ${newStatus}`
            };
        }

        return { valid: true };
    }

    static isClosingStatus(status: CaseStatusFlow): boolean {
        return CLOSING_STATUSES.includes(status);
    }

    static isSignificantStatusChange(status: CaseStatusFlow): boolean {
        return SIGNIFICANT_STATUSES.includes(status);
    }

    static getStageNameForStatus(status: CaseStatusFlow): string {
        return STAGE_NAMES[status] ?? status;
    }

    static validateCaseCreation(
        request: CreateCaseFileRequest,
        admissionType: AdmissionTypeForValidation
    ): ValidationResult[] {
        const results: ValidationResult[] = [];

        const roomValidation = this.validateRoomRequirement(admissionType, request.room_id);
        if (!roomValidation.valid) results.push(roomValidation);

        const packageValidation = this.validatePackageRequirement(
            admissionType,
            request.package_id,
            request.doctor_id
        );
        if (!packageValidation.valid) results.push(packageValidation);

        const transferValidation = this.validateTransferAllowance(
            admissionType,
            request.is_transfer,
            request.transfer_from_case_id
        );
        if (!transferValidation.valid) results.push(transferValidation);

        const paymentValidation = this.validatePaymentRequirement(admissionType, false);
        if (paymentValidation.message) results.push(paymentValidation);

        return results;
    }

    static hasErrors(results: ValidationResult[]): boolean {
        return results.some(r => !r.valid);
    }

    static getErrorMessages(results: ValidationResult[]): string[] {
        return results.filter(r => !r.valid).map(r => r.message || 'Validation error');
    }

    static getWarningMessages(results: ValidationResult[]): string[] {
        return results.filter(r => r.valid && r.message).map(r => r.message!);
    }
}
