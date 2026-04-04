import { CreateCaseFileRequest, UpdateCaseStatusRequest, CaseStatusFlow } from '../../dtos/medical-dtos/case-file.dto';
import { AdmissionTypeResponse } from '../../dtos/medical-dtos/admission-type.dto';

/**
 * Subset of admission type fields needed for validation
 */
export type AdmissionTypeForValidation = Pick<AdmissionTypeResponse,
    'name' | 'requires_hospitalization' | 'requires_package' | 'allows_transfer' | 'requires_immediate_payment'
>;

/**
 * Validation result interface
 */
interface ValidationResult {
    valid: boolean;
    message?: string;
    field?: string;
}

/**
 * Validator for case file operations with business rules
 */
export class CaseFileValidator {
    /**
     * Validate room requirement based on admission type
     */
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

    /**
     * Validate package requirement based on admission type
     */
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
                    message: `Doctor assignment is required when package is assigned`
                };
            }
        }

        return { valid: true };
    }

    /**
     * Validate transfer allowance based on admission type
     */
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

    /**
     * Validate payment requirement based on admission type
     * TODO: Implement when billing module is available
     */
    static validatePaymentRequirement(
        admissionType: AdmissionTypeForValidation,
        hasPayment: boolean
    ): ValidationResult {
        if (admissionType.requires_immediate_payment && !hasPayment) {
            // TODO: Check billing.invoices table when available
            console.warn(
                `Payment validation skipped: Admission type "${admissionType.name}" requires immediate payment but billing module is not yet integrated`
            );

            // For now, just return a warning, don't block
            return {
                valid: true,
                message: `Note: This admission type requires immediate payment`
            };
        }

        return { valid: true };
    }

    /**
     * Validate status transition based on admission type rules
     */
    static validateStatusTransition(
        admissionType: AdmissionTypeForValidation,
        currentStatus: CaseStatusFlow,
        newStatus: CaseStatusFlow,
        hasPayment: boolean = false
    ): ValidationResult {
        // Cannot transition to TRASLADO if transfers not allowed
        if (newStatus === CaseStatusFlow.TR_TRASLADO_PROCEDIMIENTO && !admissionType.allows_transfer) {
            return {
                valid: false,
                field: 'status',
                message: `Cannot transfer case: admission type "${admissionType.name}" does not allow transfers`
            };
        }

        // Cannot close case if payment required and not paid
        if (newStatus === CaseStatusFlow.C3_CERRADO && admissionType.requires_immediate_payment && !hasPayment) {
            // TODO: Implement strict validation when billing module is available
            console.warn(
                `Payment check skipped: Closing case that requires immediate payment without payment verification`
            );

            return {
                valid: true,
                message: `Warning: This case requires payment before closure`
            };
        }

        // Validate logical status flow transitions
        const invalidTransitions: Record<CaseStatusFlow, CaseStatusFlow[]> = {
            [CaseStatusFlow.C3_CERRADO]: [CaseStatusFlow.C1_CREACION], // Cannot go back to creation from closed
            [CaseStatusFlow.C2_CANCELACION]: [CaseStatusFlow.C1_CREACION], // Cannot go back to creation from cancelled
            [CaseStatusFlow.C1_CREACION]: [], // Can transition anywhere from creation
            [CaseStatusFlow.CE_CARGOS_EXPEDIENTE]: [],
            [CaseStatusFlow.CC_CONFIRMACION_CARGOS]: [],
            [CaseStatusFlow.TR_TRASLADO_PROCEDIMIENTO]: [],
            [CaseStatusFlow.RA_REAPERTURA]: [],
            [CaseStatusFlow.EX_EXTORNO]: []
        };

        if (invalidTransitions[currentStatus]?.includes(newStatus)) {
            return {
                valid: false,
                field: 'status',
                message: `Invalid status transition from ${currentStatus} to ${newStatus}`
            };
        }

        return { valid: true };
    }

    /**
     * Validate complete case file creation request
     */
    static validateCaseCreation(
        request: CreateCaseFileRequest,
        admissionType: AdmissionTypeForValidation
    ): ValidationResult[] {
        const results: ValidationResult[] = [];

        // Validate room requirement
        const roomValidation = this.validateRoomRequirement(admissionType, request.room_id);
        if (!roomValidation.valid) {
            results.push(roomValidation);
        }

        // Validate package requirement
        const packageValidation = this.validatePackageRequirement(
            admissionType,
            request.package_id,
            request.doctor_id
        );
        if (!packageValidation.valid) {
            results.push(packageValidation);
        }

        // Validate transfer allowance
        const transferValidation = this.validateTransferAllowance(
            admissionType,
            request.is_transfer,
            request.transfer_from_case_id
        );
        if (!transferValidation.valid) {
            results.push(transferValidation);
        }

        // Validate payment requirement (with TODO)
        const paymentValidation = this.validatePaymentRequirement(admissionType, false);
        if (paymentValidation.message) {
            results.push(paymentValidation);
        }

        return results;
    }

    /**
     * Check if validation results contain any errors
     */
    static hasErrors(results: ValidationResult[]): boolean {
        return results.some(r => !r.valid);
    }

    /**
     * Get error messages from validation results
     */
    static getErrorMessages(results: ValidationResult[]): string[] {
        return results.filter(r => !r.valid).map(r => r.message || 'Validation error');
    }

    /**
     * Get warning messages from validation results
     */
    static getWarningMessages(results: ValidationResult[]): string[] {
        return results.filter(r => r.valid && r.message).map(r => r.message!);
    }
}
